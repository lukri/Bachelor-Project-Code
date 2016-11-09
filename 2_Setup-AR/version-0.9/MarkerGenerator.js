/*global THREE*/

var MarkerGenerator = function(options){
    this.generate = function(options){
        options = options || {};
        
        var pattern = options.pattern || [
                [1,0,1,1,1],
                [0,1,0,0,1],
                [1,0,0,0,0],
                [0,1,0,0,1],
                [1,0,1,1,1],
        ];  
        
        /*Possible make 5 rows, each consisting of one of the 4 below
            white - black - black - black - black
            white - black - white - white - white
            black - white - black - black - white
            black - white - white - white - black
        */
        
        var squareGeom = new THREE.PlaneGeometry( 10, 10, 1, 1 );  
        var squareGeomBack = new THREE.PlaneGeometry( 10, 10, 1, 1 ); 
        squareGeomBack.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ) );
        var whiteMat = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        var blackMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        var materials = [blackMat,whiteMat];
        var marker3D = new THREE.Object3D();
    
        for (var row = -2; row<7; row++) {
            for (var col = -2; col<7; col++) {
                var tile, tileBack;
                if((pattern[row]||(pattern[row]==0))&&(pattern[row][col]||(pattern[row][col]==0))){
                    tile = new THREE.Mesh(squareGeom, materials[pattern[row][col]] );
                    tileBack = new THREE.Mesh(squareGeomBack, materials[pattern[row][col]] );
                }else{
                    if((row==-2)||(row==6)||(col==-2)||(col==6)){
                        tile = new THREE.Mesh(squareGeom, materials[1]);
                        tileBack = new THREE.Mesh(squareGeomBack, materials[1]);
                    }else{
                            tile = new THREE.Mesh(squareGeom, materials[0]);
                            tileBack = new THREE.Mesh(squareGeomBack, materials[0]);
                    }
                }
                marker3D.add(tile);
                marker3D.add(tileBack);
                tile.position.x = col*10-35;
                tile.position.y = row*(-10)+35;
                tileBack.position.x = (4-col)*(10)-35;
                tileBack.position.y = row*(-10)+35;
                            
            }
        }
        
        this.marker3D = marker3D;
        return marker3D;
    };
};