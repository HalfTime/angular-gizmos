describe( 'textFit()', function() {

  beforeEach( module( 'gizmos.directives' ) )

  // Builds an element with a sized container and the given text
  let buildElement = ( { text } ) => {
    let container = $( `<div style="width: 50px; height: 50px"></div>` ).appendTo( 'body' )
    return $( `<div>${ text }</div>` ).appendTo( container )
  }

  it( 'shrinks the font size as the text gets longer', inject(function(textFit) {
    let shortTextFontSize = textFit( buildElement( { text: 'rat' } ) )
    let mediumTextFontSize = textFit( buildElement( { text: 'a cool, dece rat' } ) )
    let longTextFontSize = textFit( buildElement( { text: 'a totally DECENT rat! I think!' } ) )

    expect( longTextFontSize ).toBeLessThan( mediumTextFontSize  )
    expect( mediumTextFontSize ).toBeLessThan( shortTextFontSize  )
  }))

} )
