#version 300 es

precision mediump float;


// we need to declare an output for the fragment shader
out vec4 outColor;

in float colorValue;

in float alphaValue;

in float rViz1Value;
in float rViz2Value;

void main() {

  if (colorValue < 0.31)
  {
    outColor = vec4(0.3, 1, 0, rViz1Value);
    return;
  }

  outColor = vec4(0,0,1,0.6 * rViz1Value);



  if (colorValue < 0.61)
  {
    outColor = vec4(0, 0, 1, rViz2Value);
    return;
  }
  
  if (colorValue < 0.9)
  {
    outColor = vec4(0, 0, 0, 0.15);
    return;
  }
  
  if (colorValue < 0.92)
  {
    outColor = vec4(0, 0, 0, 0.6 * rViz1Value);
    return;
  }
  
  if (colorValue < 0.97)
  {
    outColor = vec4(0, 0, 0, 0.6* rViz1Value);
    return;
  }

  float
    rAlpha = 0.7;


  if (colorValue == float (1))
  {
    // AA
    // RED
    outColor = vec4(1, 0, 0, rAlpha);
    return;
  }
  
  if (colorValue == float(2))
  {
    // ARBEID
    // YELLOW
    outColor = vec4(1, 1, 0, rAlpha);
    
    return;
  }
  
  if (colorValue == float(3))
  {
    // ATTF
    // PURPUR
    outColor = vec4(0.5, 0, 0.5, rAlpha);
    return;
  }

  if (colorValue == float(4))
  {
    // DAGP
    // GREEN
    outColor = vec4(0, 1, 0, rAlpha);
    return;
  }

  if (colorValue == float(5))
  {
    // ENSLIG
    // PURPLE
    outColor = vec4(1, 0, 1, rAlpha);
    return;
  }

  if (colorValue == float(7))
  {
    // INDIV
    // ORANGE
    outColor = vec4(1, 0.5, 0, rAlpha);
    return;
  }






  if (colorValue == float(6))
  {
    // FEILUTBE

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);

    
    return;
  }
 

  
  if (colorValue == float(8))
  {
    // KLAN

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(9))
  {
    // MOBIL
  // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
   
    return;
  }

  if (colorValue == float(10))
  {
    // REHAB

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  
  if (colorValue == float(11))
  {
    // SANKSJON
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(12))
  {
    // SANKSJON_A
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(13))
  {
    // SANKSJON_B
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(14))
  {
    // SYKEP

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(15))
  {
    // TILSTOVER
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(16))
  {
    // TILSTRAMME
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(17))
  {
    // TILT
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(18))
  {
    // UFOREYT
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }


  if (colorValue == float(19))
  {
    // UTRSYA
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(20))
  {
    // VLONN
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  // GRAY FOR THE REST
  outColor = vec4(0, 0, 0, rAlpha);

}

      
     
      