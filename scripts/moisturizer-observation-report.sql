-- Trusted project operator only; creates no API object. Groups are observational.
with payloads as (
  select user_id, record_id, coalesce(payload->'productObservation', payload->'moisturizerObservation') as study
  from public.journey_records
  where payload->>'source' in ('skin_product_observation', 'moisturizer_observation')
    and payload->'assessmentOnly' = 'true'::jsonb
), extracted as (
  select user_id, record_id, study,
    study->>'protocol' as protocol,
    study->>'productId' as product_id,
    study->>'formulaVerifiedAt' as formula_verified_at,
    study->>'choice' as choice,
    case when study->>'hydrationLevel' ~ '^([1-9]|10)$' then (study->>'hydrationLevel')::int end as hydration_level,
    case when jsonb_typeof(study->'sensitive') = 'boolean' then (study->>'sensitive')::boolean end as sensitive,
    case when study->>'baselineDays' ~ '^[1-7]$' then (study->>'baselineDays')::int end as baseline_days,
    case when study->>'baselineComfort' ~ '^[0-3]$' then (study->>'baselineComfort')::int end as baseline_discomfort,
    case when pg_input_is_valid(study->>'startedAt', 'timestamp with time zone')
      then (study->>'startedAt')::timestamptz end as started_at,
    case when pg_input_is_valid(study#>>'{analysisConsent,grantedAt}', 'timestamp with time zone')
      then (study#>>'{analysisConsent,grantedAt}')::timestamptz end as consent_at,
    case when pg_input_is_valid(study#>>'{followUp,recordedAt}', 'timestamp with time zone')
      then (study#>>'{followUp,recordedAt}')::timestamptz end as reported_at,
    case when study#>>'{followUp,days}' ~ '^[0-7]$' then (study#>>'{followUp,days}')::int end as reported_days,
    case when study#>>'{followUp,comfort}' ~ '^[0-3]$' then (study#>>'{followUp,comfort}')::int end as reported_discomfort
  from payloads
  where (
    (study->>'protocol' = 'cheek-tightness-v1' and study#>>'{analysisConsent,version}' = 'moisturizer-internal-analysis-v1')
    or (study->>'protocol' in ('cheek-tightness-v2', 'post-wash-tightness-v1', 'serum-cheek-tightness-v1')
      and study#>>'{analysisConsent,version}' = 'skin-product-internal-analysis-v2')
  )
    and study->>'choice' in ('start', 'keep')
    and study->>'productId' ~ '^[1-9][0-9]{0,5}$'
    and study->>'formulaVerifiedAt' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
), first_per_product as (
  select distinct on (user_id, protocol, product_id, formula_verified_at) *
  from extracted
  where baseline_days is not null
    and started_at <= now() - interval '528 hours'
    and consent_at between now() - interval '1 year' and now()
  order by user_id, protocol, product_id, formula_verified_at, started_at, record_id
), observations as (
  select *,
    case when baseline_days <= 3 then '1–3' else '4–7' end as baseline_band,
    coalesce(reported_at >= started_at + interval '336 hours'
      and reported_at < started_at + interval '528 hours', false) as in_window,
    coalesce(study#>>'{earlyCheck,reaction}' in ('irritation','stopped_irritation')
      or study#>>'{followUp,reaction}' in ('irritation','stopped_irritation'), false) as irritation,
    coalesce(study#>>'{earlyCheck,reaction}' in ('stopped_irritation','stopped_other')
      or study#>>'{followUp,reaction}' in ('stopped_irritation','stopped_other'), false) as stopped,
    coalesce(study#>>'{followUp,frequency}' = 'daily'
      and study#>>'{followUp,otherChanges}' = 'no'
      and ((choice = 'start' and study#>>'{followUp,used}' = 'recommended')
        or (choice = 'keep' and study#>>'{followUp,used}' = 'existing')), false) as matched_use,
    study#>>'{followUp,reaction}' in ('none', 'irritation', 'stopped_irritation', 'stopped_other') as known_reaction
  from first_per_product
), cohorts as (
  select protocol, product_id, formula_verified_at, hydration_level, sensitive, baseline_band, choice,
    count(*) as enrolled,
    count(*) filter (where in_window) as checked_in_days_14_to_21,
    count(*) filter (where not in_window) as missing_or_outside_window,
    count(*) filter (where in_window and reported_days is null) as unknown_tightness_days,
    count(*) filter (where in_window and reported_days is not null) as known_tightness_days,
    count(*) filter (where in_window and reported_days = 0) as no_tightness_days,
    count(*) filter (where in_window and reported_days > 0 and reported_days < baseline_days) as fewer_but_remaining,
    count(*) filter (where in_window and reported_days = baseline_days) as unchanged_days,
    count(*) filter (where in_window and reported_days > baseline_days) as more_tightness_days,
    round(avg(baseline_days - reported_days) filter (where in_window), 2) as mean_fewer_tight_days,
    count(*) filter (where in_window and baseline_discomfort is not null and reported_discomfort is not null) as paired_discomfort,
    count(*) filter (where in_window and reported_discomfort < baseline_discomfort) as lower_discomfort,
    count(*) filter (where in_window and reported_discomfort > baseline_discomfort) as higher_discomfort,
    count(*) filter (where in_window and study#>>'{followUp,otherChanges}' = 'yes') as other_changes_reported,
    count(*) filter (where in_window and reported_days is not null and matched_use and known_reaction) as comparable_follow_ups,
    count(*) filter (where in_window and reported_days = 0 and matched_use
      and study#>>'{followUp,reaction}' = 'none' and not irritation and not stopped) as comparable_no_tightness_without_reaction_or_stop,
    count(*) filter (where irritation) as irritation_reported,
    count(*) filter (where stopped) as stopped_reported
  from observations
  group by protocol, product_id, formula_verified_at, hydration_level, sensitive, baseline_band, choice
)
select *,
  (protocol <> 'cheek-tightness-v1' and hydration_level is not null and sensitive is not null
    and enrolled >= 50 and known_tightness_days * 10 >= enrolled * 8
    and comparable_follow_ups * 10 >= enrolled * 7) as enough_to_review
from cohorts
order by protocol, product_id, formula_verified_at, hydration_level, sensitive, baseline_band, choice;
