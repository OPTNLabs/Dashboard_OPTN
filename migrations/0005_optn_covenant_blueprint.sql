-- Editable reviewed inputs for the next BoundedRelease vault. Existing vaults
-- retain their own constructor values and are never changed by this row.
alter table optn_organizations
  add column if not exists covenant_max_payment_satoshis text,
  add column if not exists covenant_max_fee_satoshis text;
