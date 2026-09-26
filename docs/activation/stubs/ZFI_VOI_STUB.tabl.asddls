@EndUserText.label : 'Vendor open items test data - TRIAL STUB'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zfi_voi_stub {
  key client                  : abap.clnt not null;
  key companycode             : abap.char(4) not null;
  key supplier                : abap.char(10) not null;
  key accountingdocument      : abap.char(10) not null;
  key accountingdocumentitem  : abap.numc(6) not null;
  netduedate                  : abap.dats;
  @Semantics.amount.currencyCode : 'zfi_voi_stub.companycodecurrency'
  amountincompanycodecurrency : abap.curr(13,2);
  companycodecurrency         : abap.cuky(5);
  suppliername                : abap.char(35);
}
