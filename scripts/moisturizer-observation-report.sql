-- Trusted project operator only; creates no API object. Groups are observational.
with report_window as (
  select nullif(current_setting('dearsince.report_start', true), '')::date as period_start,
    nullif(current_setting('dearsince.report_end', true), '')::date as period_end
), protocols (protocol, consent_version, scale_max, check_day, is_cosmetic) as (values
  ('cheek-tightness-v1', 'moisturizer-internal-analysis-v1', 7, 14, false),
  ('cheek-tightness-v2', 'skin-product-internal-analysis-v2', 7, 14, false),
  ('post-wash-tightness-v1', 'skin-product-internal-analysis-v2', 7, 14, false),
  ('serum-cheek-tightness-v1', 'skin-product-internal-analysis-v2', 7, 14, false),
  ('cosmetic-dryness-v1', 'cosmetic-outcome-analysis-v3', 7, 14, true),
  ('cosmetic-flakes-v1', 'cosmetic-outcome-analysis-v3', 7, 14, true),
  ('cosmetic-sebum-v1', 'cosmetic-outcome-analysis-v3', 7, 14, true),
  ('cosmetic-pores-v1', 'cosmetic-outcome-analysis-v3', 3, 28, true),
  ('cosmetic-texture-v1', 'cosmetic-outcome-analysis-v3', 3, 28, true),
  ('cosmetic-closed-v1', 'cosmetic-outcome-analysis-v3', 4, 28, true),
  ('cosmetic-blackhead-v1', 'cosmetic-outcome-analysis-v3', 4, 28, true),
  ('cosmetic-tone-v1', 'cosmetic-outcome-analysis-v3', 3, 28, true),
  ('cosmetic-dark-mark-v1', 'cosmetic-outcome-analysis-v3', 3, 28, true),
  ('cosmetic-lines-v1', 'cosmetic-outcome-analysis-v3', 3, 28, true)
), payloads as (
  select user_id, record_id, coalesce(payload->'productObservation', payload->'moisturizerObservation') as study
  from public.journey_records
  where payload->>'source' in ('skin_product_observation', 'moisturizer_observation')
    and payload->'assessmentOnly' = 'true'::jsonb
), extracted as (
  select user_id, record_id, study, protocol, scale_max, check_day, is_cosmetic,
    study->>'productId' as product_id,
    study->>'formulaVerifiedAt' as formula_verified_at,
    study->>'choice' as choice,
    case when is_cosmetic then study->>'route' else 'basic' end as route,
    case when is_cosmetic then study->>'area' end as area,
    case when study->>'hydrationLevel' ~ '^([1-9]|10)$' then (study->>'hydrationLevel')::int end as hydration_level,
    case when jsonb_typeof(study->'sensitive') = 'boolean' then (study->>'sensitive')::boolean end as sensitive,
    case when baseline_text ~ '^[1-7]$' then baseline_text::int end as baseline_value,
    case when study->>'baselineComfort' ~ '^[0-3]$' then (study->>'baselineComfort')::int end as baseline_discomfort,
    case when pg_input_is_valid(study->>'startedAt', 'timestamp with time zone')
      then (study->>'startedAt')::timestamptz end as started_at,
    case when pg_input_is_valid(study#>>'{analysisConsent,grantedAt}', 'timestamp with time zone')
      then (study#>>'{analysisConsent,grantedAt}')::timestamptz end as consent_at,
    case when pg_input_is_valid(study#>>'{followUp,recordedAt}', 'timestamp with time zone')
      then (study#>>'{followUp,recordedAt}')::timestamptz end as reported_at,
    case when reported_text ~ '^[0-7]$' then reported_text::int end as reported_value,
    case when study#>>'{followUp,comfort}' ~ '^[0-3]$' then (study#>>'{followUp,comfort}')::int end as reported_discomfort
  from payloads
  join protocols on protocol = study->>'protocol' and consent_version = study#>>'{analysisConsent,version}'
  cross join lateral (select
    case when is_cosmetic then study->>'baselineValue' else study->>'baselineDays' end as baseline_text,
    case when is_cosmetic then study#>>'{followUp,value}' else study#>>'{followUp,days}' end as reported_text
  ) as measures
  where study->>'choice' in ('start', 'keep')
    and study->>'productId' ~ '^[1-9][0-9]{0,5}$'
    and study->>'formulaVerifiedAt' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and (not is_cosmetic or (study->>'area' in ('forehead', 'cheeks', 'nose', 'chin', 'tzone', 'whole', 'other')
      and (study->>'route', protocol) in (
        ('basic', 'cosmetic-dryness-v1'), ('basic', 'cosmetic-flakes-v1'), ('basic', 'cosmetic-sebum-v1'),
        ('support', 'cosmetic-dryness-v1'), ('support', 'cosmetic-flakes-v1'),
        ('sebum', 'cosmetic-sebum-v1'), ('sebum', 'cosmetic-pores-v1'),
        ('texture', 'cosmetic-texture-v1'), ('texture', 'cosmetic-closed-v1'), ('texture', 'cosmetic-blackhead-v1'),
        ('tone', 'cosmetic-tone-v1'), ('tone', 'cosmetic-dark-mark-v1'), ('lines', 'cosmetic-lines-v1')
      )))
), first_per_product as (
  select distinct on (user_id, protocol, product_id, formula_verified_at) *
  from extracted
  where baseline_value between 1 and scale_max
    and isfinite(started_at) and started_at <= now() - (check_day + 8) * interval '24 hours'
    and consent_at between now() - interval '1 year' and now()
  order by user_id, protocol, product_id, formula_verified_at, started_at, record_id
), observations as (
  select first_per_product.*,
    case when baseline_value <= (scale_max + 1) / 2
      then 'lower' else 'higher' end as baseline_band,
    coalesce(reported_at >= started_at + check_day * interval '24 hours'
      and reported_at < started_at + (check_day + 8) * interval '24 hours', false) as in_window,
    case when reported_value between 0 and scale_max then reported_value end as outcome,
    coalesce(study#>>'{earlyCheck,reaction}' in ('irritation','stopped_irritation')
      or study#>>'{followUp,reaction}' in ('irritation','stopped_irritation'), false) as irritation,
    coalesce(study#>>'{earlyCheck,reaction}' in ('stopped_irritation','stopped_other')
      or study#>>'{followUp,reaction}' in ('stopped_irritation','stopped_other'), false) as stopped,
    coalesce(study#>>'{followUp,frequency}' = 'daily'
      and study#>>'{followUp,otherChanges}' = 'no'
      and (not is_cosmetic or study#>>'{followUp,useDays}' in ('14_27', '28_plus')
        or (check_day = 14 and study#>>'{followUp,useDays}' = '7_13'))
      and ((choice = 'start' and study#>>'{followUp,used}' = 'recommended')
        or (choice = 'keep' and study#>>'{followUp,used}' = 'existing')), false) as matched_use,
    study#>>'{followUp,reaction}' in ('none', 'irritation', 'stopped_irritation', 'stopped_other') as known_reaction
  from first_per_product
  cross join report_window
  where (period_start is null or started_at >= (period_start::timestamp at time zone 'UTC'))
    and (period_end is null or started_at < (period_end::timestamp at time zone 'UTC'))
), cohorts as (
  select protocol, product_id, formula_verified_at, hydration_level, sensitive, area, route, baseline_band, choice, check_day,
    count(*) as enrolled,
    count(*) filter (where in_window) as checked_in_window,
    count(*) filter (where not in_window) as missing_or_outside_window,
    count(*) filter (where in_window and outcome is null) as unknown_outcomes,
    count(*) filter (where in_window and outcome is not null) as known_outcomes,
    count(*) filter (where in_window and outcome = 0) as none_reported,
    count(*) filter (where in_window and outcome > 0 and outcome < baseline_value) as improved_but_remaining,
    count(*) filter (where in_window and outcome = baseline_value) as unchanged,
    count(*) filter (where in_window and outcome > baseline_value) as worse,
    round(avg(baseline_value - outcome) filter (where in_window and scale_max = 7), 2) as mean_fewer_symptom_days,
    count(*) filter (where in_window and baseline_discomfort is not null and reported_discomfort is not null) as paired_discomfort,
    count(*) filter (where in_window and reported_discomfort < baseline_discomfort) as lower_discomfort,
    count(*) filter (where in_window and reported_discomfort > baseline_discomfort) as higher_discomfort,
    count(*) filter (where in_window and study#>>'{followUp,otherChanges}' = 'yes') as other_changes_reported,
    count(*) filter (where in_window and outcome is not null and matched_use and known_reaction) as comparable_follow_ups,
    count(*) filter (where in_window and outcome = 0 and matched_use
      and study#>>'{followUp,reaction}' = 'none' and not irritation and not stopped) as comparable_none_without_reaction_or_stop,
    count(*) filter (where in_window and outcome > 0 and outcome < baseline_value and matched_use
      and study#>>'{followUp,reaction}' = 'none' and not irritation and not stopped) as comparable_improved_but_remaining_without_reaction_or_stop,
    count(*) filter (where irritation) as irritation_reported,
    count(*) filter (where stopped) as stopped_reported
  from observations
  group by protocol, product_id, formula_verified_at, hydration_level, sensitive, area, route, baseline_band, choice, check_day
)
select *,
  (protocol <> 'cheek-tightness-v1' and hydration_level is not null and sensitive is not null
    and enrolled >= 50 and known_outcomes * 10 >= enrolled * 8
    and comparable_follow_ups * 10 >= enrolled * 7
    and paired_discomfort * 10 >= enrolled * 7) as enough_to_review,
  period_start, period_end
from cohorts
cross join report_window
order by protocol, product_id, formula_verified_at, hydration_level, sensitive, area, route, baseline_band, choice;
