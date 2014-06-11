
/* *
 *
 *  Fixture config. Will be overwritten on run
 *
 * */

define({
  title : 'Plato Report Title',
  'plato-complexity-report' : {
    'newmi' : true
  },
  layout : {
    overview : [
      [
        '<h1>{{config.title}}</h1>'
      ],
      [
        '<h2>Maintainability</h2><average source="reports[\'plato-complexity-report\'].summary" property="maintainability" places="2"></average>',
        '<h2>SLOC</h2><average source="reports[\'plato-complexity-report\'].summary" property="sloc.physical" places="2"></average>'
      ],
      [
        '<h3>Maintainability</h3><plato-barchart source="reports[\'plato-complexity-report\'].summary" property="maintainability"></plato-barchart>',
      ]
    ]
  }
});