varying vec3 worldSpaceCoords;
varying vec4 projectedCoords;
uniform sampler2D tex, cubeTex, transferTex;
uniform float steps;
uniform float alphaCorrection;
uniform vec3 origin;

//Acts like a texture3D using Z slices and trilinear filtering.
float sampleAs3DTexture( vec3 texCoord )
{
    vec4 colorSlice1, colorSlice2;
    vec2 texCoordSlice1, texCoordSlice2;
    
    //The z coordinate determines which Z slice we have to look for.
    //Z slice number goes from 0 to 255.
    float zSliceNumber1 = floor(texCoord.z  * 255.0);
    
    //As we use trilinear we go the next Z slice.
    float zSliceNumber2 = min( zSliceNumber1 + 1.0, 255.0); //Clamp to 255
    
    //The Z slices are stored in a matrix of 16x16 of Z slices.
    //The original UV coordinates have to be rescaled by the tile numbers in each row and column.
    texCoord.xy /= 16.0;
    
    texCoordSlice1 = texCoordSlice2 = texCoord.xy;
    
    //Add an offset to the original UV coordinates depending on the row and column number.
    texCoordSlice1.x += (mod(zSliceNumber1, 16.0 ) / 16.0);
    texCoordSlice1.y += floor((255.0 - zSliceNumber1) / 16.0) / 16.0;
    
    texCoordSlice2.x += (mod(zSliceNumber2, 16.0 ) / 16.0);
    texCoordSlice2.y += floor((255.0 - zSliceNumber2) / 16.0) / 16.0;
    
    //Get the opacity value from the 2D texture.
    //Bilinear filtering is done at each texture2D by default.
    colorSlice1 = texture2D( cubeTex, texCoordSlice1 );
    colorSlice2 = texture2D( cubeTex, texCoordSlice2 );
    
    float zDifference = mod(texCoord.z * 255.0, 1.0);
    float v = mix(colorSlice1.a, colorSlice2.a, zDifference);
    return v;
}

vec4 classify(float value)
{
    return texture2D( transferTex, vec2( value, 1.0) ).rgba;
}

vec3 gradient(vec3 psample, float value)
{
    float dcd = .001;
    vec3 p = psample;
    vec3 grad;
    p.x -= dcd;
    grad.x = sampleAs3DTexture(p);
    p.x = psample.x + dcd;
    grad.x -= sampleAs3DTexture(p);
    p.x = psample.x;
    p.y -= dcd;
    grad.y = sampleAs3DTexture(p);
    p.y = psample.y + dcd;
    grad.y -= sampleAs3DTexture(p);
    p.y = psample.y;
    p.z -= dcd;
    grad.z = sampleAs3DTexture(p);
    p.z = psample.z + dcd;
    grad.z -= sampleAs3DTexture(p);
    
    return normalize(grad);
}

vec3 shade(vec3 material_color, vec3 p, float value, vec3 dir)
{
    vec3 normal = gradient(p, value);
    vec3 light_direction = -normalize(dir);
    
    vec3 v = -normalize(dir);
    float n_dot_v = dot(normal, v);
    
    if (n_dot_v < 0.0)
        normal = -normal;
    float n_dot_l = dot(normal, light_direction);
    vec3 color = .15 * vec3(1.0,1.0,1.0);
    if (n_dot_l > 0.0) //diffuse
    {
        vec3 diffuse;
        diffuse = vec3(min(max(n_dot_l, 0.0), 1.0));
        color += diffuse * material_color;
        //specular
        vec3 half_vector = normalize(v + light_direction);
        float n_dot_h = max( dot(normal, half_vector),0.0);
        color += vec3(pow( n_dot_h, 32.0 ));
    }
    
    return color;
}

void main( void ) {
    
    // ******* Your solution here! *******
    
    //Transform the coordinates it from [-1;1] to [0;1]
    vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,
                     ((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0 );
    
    //The back position is the world space position stored in the texture.
    vec3 backPos = texture2D(tex, texc).xyz;
    
    //The front position is the world space position of the second render pass.
    vec3 frontPos = worldSpaceCoords;
    
    //The direction from the front position to back position.
    vec3 dir = backPos - frontPos;
    float rayLength = length(dir);
    
    //the step size, i.e. “delta t” from the Engel slides.
    float dt = 1.0 / steps;
    
    vec3 dtDirection = normalize(dir) * dt;
    vec3 p = frontPos;
    
    vec4 accumulatedColor = vec4(0.0);
    float accumulatedAlpha = 0.0;
    float t = 0.0;
				
    for(int i = 0; i < 4096; i++)
    {
        vec4 colorSample = classify(sampleAs3DTexture(p));
        float alphaSample = colorSample.a * alphaCorrection;
        
        //front-to-back compositing
        accumulatedColor += (1.0 - accumulatedAlpha) * colorSample * alphaSample;
        accumulatedAlpha += alphaSample;
        
        // Lighting Extra part
        colorSample.rgb = shade(colorSample.rgb, p, sampleAs3DTexture(p), dir);
        
        p += dtDirection;
        t += dt;
                    
        //exit or early termination
        if(t >= rayLength || accumulatedAlpha >= .97 )
            break;
        }
    
    gl_FragColor  = accumulatedColor;
    
}

