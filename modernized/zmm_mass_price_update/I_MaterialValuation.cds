/*
 * Modernized artefact: I_MaterialValuation
 * Origin:              ZMM_MASS_PRICE_UPDATE (samples/legacy/zmm_mass_price_update.abap)
 * Sub-agent:           zmm_mass_price_update_agent
 * Verification status: Needs target verification
 *
 * CANDIDATE: I_MaterialStock may not expose STPRS or VPRSV.
 * The correct released view for material valuation / standard price must be
 * verified on the target.  Candidates include I_MaterialValuation,
 * I_ProductValuationData, or a similar released entity.
 * Do NOT activate until confirmed.
 *
 * Findings addressed:
 *   F-02  CC-01  – replaces direct SELECT on MBEW with a released CDS view
 *   F-07  CC-10  – removes coupling to unreleased MBEW dictionary type
 */

@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Material Valuation – candidate released view'
@Metadata.ignorePropagatedAnnotations: true

/* candidate */
define view entity I_MaterialValuation
  as select from I_MaterialStock /* candidate: verify this source exposes STPRS and VPRSV */
{
      /* candidate: BWKEY mapped to Plant — verify field name in actual released view */
  key Plant,                /* candidate */

      /* candidate: MATNR mapped to Material — verify field name in actual released view */
  key Material,             /* candidate */

      /* candidate: STPRS mapped to StandardPrice — field may not exist on I_MaterialStock */
      StandardPrice,        /* candidate */

      /* candidate: VPRSV mapped to PriceControl — field may not exist on I_MaterialStock */
      PriceControl          /* candidate */
}
