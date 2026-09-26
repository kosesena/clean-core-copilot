@EndUserText.label : 'Ageing run log - TRIAL STUB, not Bob output'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zfi_aging_log {
  key client : abap.clnt not null;
  key bukrs  : abap.char(4) not null;
  last_run   : abap.dats;
}
