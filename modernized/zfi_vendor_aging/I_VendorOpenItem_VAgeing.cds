/*
 * CDS View Entity: I_VendorOpenItem_VAgeing
 *
 * Purpose : Read-side for vendor open items, replaces the legacy
 *           SELECT on BSEG + LFA1 (findings F-01, F-02).
 *
 * Verification status : CANDIDATE – none of the consumed views has been
 *   confirmed as released on the target product / release (both unknown).
 *   Before activating:
 *   1. Confirm I_OperationalAcctgDocItem is released for the target.
 *   2. Confirm I_Supplier             is released for the target.
 *   3. Verify that field NetDueDate maps to legacy ZFBDT (net due date).
 *   4. Verify that AccountType = 'K' is the correct open-item predicate.
 *   5. Verify that IsCleared = ''    is the correct open-item predicate
 *      (replaces AUGBL = space; exact field name needs target confirmation).
 *   6. Verify CompanyCodeCurrency / AmountInCompanyCodeCurrency maps to
 *      legacy DMBTR; check whether currency conversion is still required
 *      (see finding F-07 / Unclassified).
 *
 * Target product  : unknown
 * Target release  : unknown
 * Language version: ABAP for Cloud Development
 */

@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Vendor Open Items for Ageing Report'
@Metadata.ignorePropagatedAnnotations: true

-- candidate: I_OperationalAcctgDocItem release not verified
define view entity I_VendorOpenItem_VAgeing
  as select from I_OperationalAcctgDocItem as item  /* candidate */

  -- candidate: I_Supplier release not verified
  inner join   I_Supplier                  as sup   /* candidate */
    on sup.Supplier = item.Supplier

{
      /*-- Company code (selection parameter) */
  key item.CompanyCode,

      /*-- Vendor account */
  key item.Supplier,

      /*-- Accounting document number */
  key item.AccountingDocument,

      /*-- Net due date – maps to legacy BSEG-ZFBDT
          Field name 'NetDueDate' is a candidate; verify on target */
      item.NetDueDate,

      /*-- Amount in company-code currency – maps to legacy BSEG-DMBTR
          Currency-conversion requirement unresolved (see F-07).
          Field name 'AmountInCompanyCodeCurrency' is a candidate. */
      item.AmountInCompanyCodeCurrency,

      /*-- Vendor name – maps to legacy LFA1-NAME1
          Field name 'SupplierName' on I_Supplier is a candidate. */
      sup.SupplierName

}
where
      /*-- Vendor line items only (maps to BSEG-KOART = 'K')
          Predicate 'AccountType = ''K''' is a candidate; verify field exists. */
      item.AccountType = 'K'

  /*-- Open items only (maps to BSEG-AUGBL = space)
       'IsCleared' is a candidate field name; verify on target.
       Alternative: use a dedicated I_VendorOpenItem* entity if released. */
  and item.IsCleared = ''
