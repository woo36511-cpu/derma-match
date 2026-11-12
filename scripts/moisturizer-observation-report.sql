-- Run as a trusted project operator. This report creates no API object.
-- Descriptive counts only; the two self-selected strategies are not randomized.
with payloads as (
  select user_id, record_id, payload->'moisturizerObservation' as study
  from public.journey_records
  where payload->>'source' = 'moisturizer_observation'
    and payload->'assessmentOnly' = 'true'::jsonb
), extracted as (
  select user_id, record_id, study,
    study->>'productId' as product_id,
    study->>'formulaVerifiedAt' as formula_verified_at,
    study->>'choice' as choice,
    case when study->>'baselineDays' ~ '^[1-7]$' then (study->>'baselineDays')::int end as baseline_days,
    case when pg_input_is_valid(study->>'startedAt', 'timestamp with time zone')
      then (study->>'startedAt')::timestamptz end as started_at,
    case when pg_input_is_valid(study#>>'{analysisConsent,grantedAt}', 'timestamp with time zone')
      then (study#>>'{analysisConsent,grantedAt}')::timestamptz end as consent_at,
    case when pg_input_is_valid(study#>>'{followUp,recordedAt}', 'timestamp with time zone')
      then (study#>>'{followUp,recordedAt}')::timestamptz end as reported_at,
    case when study#>>'{followUp,days}' ~ '^[0-7]$' then (study#>>'{followUp,days}')::int end as reported_days
  from payloads
  where study->>'protocol' = 'cheek-tightness-v1'
    and study#>>'{analysisConsent,version}' = 'moisturizer-internal-analysis-v1'
    and study->>'choice' in ('start', 'keep')
    and study->>'productId' ~ '^[1-9][0-9]{0,5}$'
), first_per_product as (
  select distinct on (user_id, product_id, formula_verified_at) *
  from extracted
  where baseline_days is not null
    and started_at <= now() - interval '528 hours'
    and consent_at between now() - interval '1 year' and now()
  order by user_id, product_id, formula_verified_at, started_at, record_id
), counts as (
  select *,
    case when baseline_days <= 3 then '1–3' else '4–7' end as baseline_band,
    coalesce(reported_at >= started_at + interval '336 hours'
      and reported_at < started_at + interval '528 hours' and reported_days is not null, false) as in_window
  from first_per_product
)
select product_id, formula_verified_at, baseline_band, choice,
  count(*) as enrolled,
  count(*) filter (where in_window) as checked_in_days_14_to_21,
  count(*) filter (where not in_window) as missing_or_outside_window,
  count(*) filter (where in_window and study#>>'{followUp,used}' = 'recommended') as used_recommended,
  count(*) filter (where in_window and study#>>'{followUp,used}' = 'existing') as used_existing,
  count(*) filter (where in_window and study#>>'{followUp,frequency}' = 'daily'
    and study#>>'{followUp,otherChanges}' = 'no'
    and ((choice = 'start' and study#>>'{followUp,used}' = 'recommended')
      or (choice = 'keep' and study#>>'{followUp,used}' = 'existing'))) as daily_matching_choice_without_other_changes,
  count(*) filter (where in_window and study#>>'{followUp,otherChanges}' = 'yes') as other_changes_reported,
  count(*) filter (where study#>>'{earlyCheck,reaction}' in ('irritation','stopped_irritation')
    or study#>>'{followUp,reaction}' in ('irritation','stopped_irritation')) as irritation_reported,
  count(*) filter (where study#>>'{earlyCheck,reaction}' in ('stopped_irritation','stopped_other')
    or study#>>'{followUp,reaction}' in ('stopped_irritation','stopped_other')) as stopped_reported,
  round(avg(baseline_days - reported_days) filter (where in_window), 2) as mean_fewer_tight_days,
  count(*) filter (where in_window and baseline_days - reported_days >= 2) as two_or_more_fewer_days
from counts
group by product_id, formula_verified_at, baseline_band, choice
order by product_id, formula_verified_at, baseline_band, choice;
