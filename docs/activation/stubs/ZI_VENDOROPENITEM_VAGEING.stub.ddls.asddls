/*
 * TRIAL STUB - test double, NOT Bob's output.
 * Bob's view (../ZI_VENDOROPENITEM_VAGEING.ddls.asddls) reads
 * I_OperationalAcctgDocItem and I_Supplier, which do not exist on the
 * BTP trial system (recorded 26 Sep, SDDL_PARSER_MSG 004). This stub keeps
 * Bob's element names and types so ZCL_VENDOR_AGING compiles unchanged and
 * its seven ABAP Unit tests can run. It proves the class logic, not the
 * integration with SAP finance data.
 */
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'STUB: vendor open items (trial test double)'
define view entity ZI_VendorOpenItem_VAgeing
  as select from zfi_voi_stub
{
  key companycode                 as CompanyCode,
  key supplier                    as Supplier,
  key accountingdocument          as AccountingDocument,
  key accountingdocumentitem      as AccountingDocumentItem,
      netduedate                  as NetDueDate,
      @Semantics.amount.currencyCode: 'CompanyCodeCurrency'
      amountincompanycodecurrency as AmountInCompanyCodeCurrency,
      companycodecurrency         as CompanyCodeCurrency,
      suppliername                as SupplierName
}
