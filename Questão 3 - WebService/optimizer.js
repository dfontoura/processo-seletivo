export default function optimizer( containerSize, boxTypesInfos ) {

// ########## Constants and Variables ##########

    const container = copyContainer(containerSize)
    const boxTypes = copyBoxTypes(boxTypesInfos)
    
    let boxStock = []         // to control how many boxes left
    for (let boxType of boxTypes) {
        boxStock.push ( boxType.initialQuantity )
    }

    let floorOccupationTable = []
    editTable(floorOccupationTable, 0, container.length, 0, container.width, 0, container.height, 0)

    var theBestSolution = {
        volume: 0,
        howManyBoxes: 0,
        boxes: []
    }

    var level = 0

    // ########## Action! ##########

    theBestSolution = solutionSeeker ( { x: 0, y: 0, z: 0 }, floorOccupationTable, boxStock, theBestSolution)      //recursive function

    console.log( `OK. sending the best solution found.` )
    
    return theBestSolution


    // ########## Functions ##########


    function solutionSeeker(startPoint, occupationTable, boxStock, solution) {
        
        var bestSolution = copySolution(solution)

        let z = startPoint.z
         
        while ( z < container.height ) {

            scrolling_floor:  
            for ( let x = startPoint.x ; x < container.length ; x++) {
            
                for ( let y = startPoint.y ; y < container.width ; y++) {
            
                    if ( occupationTable[ x + ","  + y] === 0 ) { //found an empty spot

                        let solutionFound = false 
                        for (let index in boxTypes) { 
                            
                            let potentialSolution = tryWithThisBox (index, {x: x, y: y, z: z}, occupationTable, boxStock, bestSolution)
                            
                            if ( potentialSolution != false ) {
                                solutionFound = true
                                if ( potentialSolution.volume > bestSolution.volume ) {
                                    bestSolution = copySolution(potentialSolution)
                                } 
                            } else {
                                if ( noMoreBoxes ( boxStock ) ) {
                                    return bestSolution
                                }
                            }
                        }
                        if ( solutionFound ) {
                            return bestSolution
                        } else {
                            continue scrolling_floor    //continue to the next x
                        }
                    }
                }
                startPoint.y = 0
            }
            z = raiseTheFloor (z, occupationTable, bestSolution)
            startPoint.x = 0
            startPoint.y = 0
        }

        return bestSolution



        // #### Functions ####
      
        function noMoreBoxes(boxStock) {
            for (let index in boxStock) {
                if ( boxStock[index] > 0 ) {
                    return false
                }
            }
            return true
        }



        function raiseTheFloor(z, floorOccupationTable, bestSolution) {
            let nextFloorHeight = container.height
            for (let box of bestSolution.boxes) {
                if ( box.maxZ < nextFloorHeight && box.maxZ > z ) {
                    nextFloorHeight = box.maxZ
                }
            }
            for (let box of bestSolution.boxes) {
                if ( box.maxZ <= nextFloorHeight ) {
                    editTable(floorOccupationTable, box.x, box.maxX, box.y, box.maxY, 0)
                }
            }
            return nextFloorHeight
        }

    }


    function tryWithThisBox (boxTypeIndex, location, occupationTable, boxesStock, solution) {
        
        level++        
        let floorOccupationTable = copyTable(occupationTable)
        let potentialSolution = copySolution(solution)
        let boxStock = copyBoxStock(boxesStock)
        let position = copyPosition(location)
        let theBox = {}
 
        if ( theBoxFits() ) { 
            addBoxToContainer()
            potentialSolution = solutionSeeker(position, floorOccupationTable, boxStock, potentialSolution)
        } else return false
            
        return potentialSolution

    
        
        // #### Functions ####
        
        function theBoxFits(){
 
            if ( boxStock[boxTypeIndex] === 0 ) {
                return false
            }

            theBox = { 
                boxTypeIndex: boxTypeIndex, 
                x: position.x,
                maxX: position.x + boxTypes[boxTypeIndex].length,
                y: position.y,
                maxY: position.y + boxTypes[boxTypeIndex].width,
                z: position.z,
                maxZ: position.z + boxTypes[boxTypeIndex].height,
                width: boxTypes[boxTypeIndex].width,
                length: boxTypes[boxTypeIndex].length,
                height: boxTypes[boxTypeIndex].height,
                name: boxTypes[boxTypeIndex].name
            }

            if ( ( theBox.maxX > container.length) || 
                 ( theBox.maxY > container.width ) ||
                 ( theBox.maxZ > container.height ) ) {
                    return false
            }
            
            if ( potentialSolution.boxes ) {      
                for (let aBox of potentialSolution.boxes) {    //Collision test:
                        if ( (theBox.x < aBox.maxX && theBox.maxX > aBox.x) &&
                        (theBox.y < aBox.maxY && theBox.maxY > aBox.y) &&
                        (theBox.z < aBox.maxZ && theBox.maxZ > aBox.z) ) {
                            return false
                    }
                
                }
            }

            return true                  
        }

        
        

        function addBoxToContainer() {
            let boxVolume = boxTypes[boxTypeIndex].length * boxTypes[boxTypeIndex].width * boxTypes[boxTypeIndex].height 
            
            potentialSolution.volume = Math.round(potentialSolution.volume + boxVolume) 
            potentialSolution.howManyBoxes++          
            console.log(`Boxes added: ${potentialSolution.howManyBoxes}`); //log
            potentialSolution.boxes.push (theBox)
            boxStock[theBox.boxTypeIndex]--
            editTable(floorOccupationTable, theBox.x, theBox.maxX, theBox.y, theBox.maxY, 1)
            position.y = theBox.maxY
        }
    }
        


    function copySolution(originalSolution) {
        let newSolution = {
            volume: 0,
            howManyBoxes: 0,
            boxes: []
        }

        if ( originalSolution.boxes.length > 0 ) {
            newSolution = {
                volume: Math.round(originalSolution.volume),
                howManyBoxes: Math.round(originalSolution.howManyBoxes),
                boxes: []
            }                     
            for ( let box of originalSolution.boxes ) {
                newSolution.boxes.push( { boxTypeIndex: box.boxTypeIndex, x: box.x, y: box.y, z: box.z, maxX: box.maxX, maxY: box.maxY, maxZ: box.maxZ, width: box.width, length: box.length, height: box.height, name: box.name  } )
            }
        }
        return newSolution
    }


    function copyTable(originTable) {
        let newTable = []
        if ( originTable ) {
            for ( let x = 0 ; x < container.length ; x++ ) {
                for ( let y = 0 ; y < container.width ; y++) {
                    newTable [ x + ","  + y] = Math.round( originTable [ x + ","  + y] )
                }
            }
        }
        return newTable
    }


    function copyBoxStock(originalBoxStock) {
        let newBoxStock = []
        if ( originalBoxStock ) {
            for ( let box of originalBoxStock ) {
                newBoxStock.push(box)
            }
        }
        return newBoxStock
    }


    function copyPosition(originalPosition) {
        let newPosition = { 
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z
        }
        return newPosition
    }


    function copyContainer(originalContainer) {
        let newContainer = { 
            width: parseInt(originalContainer.width),
            length: parseInt(originalContainer.length),
            height: parseInt(originalContainer.height)
        }
        return newContainer
    }



    function copyBoxTypes(originalBoxTypes) {
        let newBoxTypes = []

        for ( let boxType of originalBoxTypes ) {
            newBoxTypes.push( { 
                id: parseInt(boxType.id), 
                name: boxType.name,
                width: parseInt(boxType.width),
                length: parseInt(boxType.length),
                height: parseInt(boxType.height),
                initialQuantity: parseInt(boxType.initialQuantity)
            } )
        }
        return newBoxTypes
    }


    function editTable(table, startX, maxX, startY, maxY, fill) {
        for ( let x = startX ; x < maxX ; x++ ) {
            for ( let y = startY ; y < maxY ; y++) {
                table [ x + ","  + y] = fill
            }
        }
    }

    
}







