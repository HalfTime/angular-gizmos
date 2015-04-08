describe( 'textFit directive', function() {

  beforeEach( module( 'gizmos.textFit' ) )

  let render = ( text ) => {
    let template = `
      <div style="width: 80px; height: 80px">
        <div text-fit="text"></div>
      </div>
    `
    let el = helpers.compile(template, { text } ).appendTo( 'body' )
    helpers.flush()
    return el
  }

  it( 'sets an inline font-size style', function() {
    let html = render( 'hi there' ).html()
    expect( html ).toMatch( 'font-size:' )
  } )
} )
