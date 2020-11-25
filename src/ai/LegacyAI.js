class CPUMap {
    constructor() {
        this.nImpH = 0; // horizontal
        this.nImpHtwo = 0;
        this.nImpV = 0; // vertical
        this.nImpVtwo = 0;
        this.nImpL = 0; // \\
        this.nImpLtwo = 0;
        this.nImpR = 0; // //
        this.nImpRtwo = 0;

        this.nImportance = 0; // Importance
        this.nWeight = 0; // Weight
        this.nTwoSided = false;
        this.nSides = 0;
    }
}

const PLAYER_ID_HUMAN = 1;
const PLAYER_ID_CPU = 2;

export default class LegacyAI {
    width = 0;
    height = 0;
    victoryCondition = 0;
    
    constructor(width, height, victoryCondition) {
        this.width = width;
        this.height = height;
        this.victoryCondition = victoryCondition;
    }
    
    getEmptyCpuMap() {
        return Array(this.height).fill(null).map(row => new Array(this.width).fill(null).map(item => new CPUMap()));
    }
    
    getNextMove(board) {
        //aiFeedback
        var foundPlayer   = 0
        var foundMarks    = 0
        var firstFound    = -1
        var cpuTaskId     = 0
        
        // defense vars
        var maxDefX     = -1
        var maxDefY     = -1
        var maxDefValue = 0
        var maxDefSides = false
        
        // expand vars
        var maxExpX     = -1
        var maxExpY     = -1
        var maxExpValue = 0
        var maxExpSides = 0
        
        //// DEFENSE
        /////////////////////////////////////////////////////////////////////////////////////////////////
        
        // Create empty CPU map
        let arrCPUMap = this.getEmptyCpuMap();
        
        // Check horizontally
        for (let iY = 0; iY < this.height; iY++) {
            foundPlayer = 0
            foundMarks = 0
            firstFound = -1
            
            for (let iX = 0; iX < this.width; iX++) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_CPU) {
                    if (board[iY][iX] !== PLAYER_ID_CPU) {
                        arrCPUMap[iY][iX].nImpH = foundMarks
                        
                        if (firstFound === -1) {
                            arrCPUMap[iY][iX].nImpHtwo++
                        } else {
                            arrCPUMap[iY][iX].nImpHtwo++
                            arrCPUMap[iY][firstFound].nImpHtwo++
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFound = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iX === 0) {
                            firstFound = -1
                        } else {
                            if (board[iY][iX - 1] === PLAYER_ID_CPU) {
                                firstFound = -1
                            } else {
                                firstFound = iX - 1
                                arrCPUMap[iY][firstFound].nImpH++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFound > -1) {
                            arrCPUMap[iY][firstFound].nImpH++
                        }
                    }
                }
            }
        }
        
        // check vertically
        for (let iX = 0; iX < this.width; iX++) {
            foundPlayer = 0
            foundMarks = 0
            firstFound = -1
            
            for (let iY = 0; iY < this.height; iY++) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_CPU) {
                    if (board[iY][iX] !== PLAYER_ID_CPU) {
                        arrCPUMap[iY][iX].nImpV += foundMarks
                        
                        if (firstFound === -1) {
                            arrCPUMap[iY][iX].nImpVtwo++
                        } else {
                            arrCPUMap[iY][iX].nImpVtwo++
                            arrCPUMap[firstFound][iX].nImpVtwo++
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFound = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iY === 0) {
                            firstFound = -1
                        } else {
                            if (board[iY - 1][iX] === PLAYER_ID_CPU) {
                                firstFound = -1
                            } else {
                                firstFound = iY - 1
                                arrCPUMap[firstFound][iX].nImpV++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFound > -1) {
                            arrCPUMap[firstFound][iX].nImpV++
                        }
                    }
                }
            }
        }
        
        // átlósan / bal-lentről jobb-felfele
        var iStartX = 0
        var iStartY = this.victoryCondition - 1
        var firstFoundX = -1
        var firstFoundY = -1
        var iX = iStartX
        var iY = iStartY
        
        while (iX < this.width || iY < this.height - this.victoryCondition - 1) {
            iX = iStartX
            iY = iStartY
            foundPlayer = 0
            foundMarks = 0
            firstFoundX = -1
            firstFoundY = -1
            
            while (iX < this.width && iY >= 0) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_CPU) {
                    if (board[iY][iX] !== PLAYER_ID_CPU) {
                        arrCPUMap[iY][iX].nImpR += foundMarks
                        
                        if (firstFoundX === -1) {
                            arrCPUMap[iY][iX].nImpRtwo++
                        } else {
                            arrCPUMap[iY][iX].nImpRtwo++
                            arrCPUMap[firstFoundY][firstFoundX].nImpRtwo++
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFoundX = -1
                    firstFoundY = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iX === 0 || iY === this.height - 1) {
                            firstFoundX = -1
                            firstFoundY = -1
                        } else {
                            if (board[iY + 1][iX - 1] === PLAYER_ID_CPU) {
                                firstFoundX = -1
                                firstFoundY = -1
                            } else {
                                firstFoundX = iX - 1
                                firstFoundY = iY + 1
                                arrCPUMap[firstFoundY][firstFoundX].nImpR++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFoundX > -1) {
                            arrCPUMap[firstFoundY][firstFoundX].nImpR++
                        }
                    }
                }
                iX++
                iY--
            }
            
            if (iStartY < this.height - 1) {
                iStartY++
            } else {
                iStartX++
            }
        }
        
        // átlósan \ bal-fentről jobb-lefele
        iStartX = 0
        iStartY = this.height - this.victoryCondition
        iX = iStartX
        iY = iStartY
        
        while (iX < this.width || iY > this.victoryCondition) {
            iX = iStartX
            iY = iStartY
            foundPlayer = 0
            foundMarks = 0
            firstFoundX = -1
            firstFoundY = -1
            
            while (iX < this.width && iY < this.height) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_CPU) {
                    if (board[iY][iX] !== PLAYER_ID_CPU) {
                        arrCPUMap[iY][iX].nImpL += foundMarks
                        
                        if (firstFoundX === -1) {
                            arrCPUMap[iY][iX].nImpLtwo++
                        } else {
                            arrCPUMap[iY][iX].nImpLtwo++
                            arrCPUMap[firstFoundY][firstFoundX].nImpLtwo++
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFoundX = -1
                    firstFoundY = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iX === 0 || iY === 0) {
                            firstFoundX = -1
                            firstFoundY = -1
                        } else {
                            if (board[iY - 1][iX - 1] === PLAYER_ID_CPU) {
                                firstFoundX = -1
                                firstFoundY = -1
                            } else {
                                firstFoundX = iX - 1
                                firstFoundY = iY - 1
                                arrCPUMap[firstFoundY][firstFoundX].nImpL++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFoundX > -1) {
                            arrCPUMap[firstFoundY][firstFoundX].nImpL++
                        }
                    }
                }
                iX++
                iY++
            }
            
            if (iStartY > 0) {
                iStartY--
            } else {
                iStartX++
            }
        }
        
        // Összegezi az eredményeket egy számba
        for (iX = 0; iX < this.width; iX++) {
            for (iY = 0; iY < this.height; iY++) {
                // a legnagyobb érték marad meg, az összes összege pedig lesz a weight (habár az még mindig nem 100-as igy)
                // az összeadós megoldás egyszerűen nem jó
                arrCPUMap[iY][iX].nImportance = Math.max(Math.max(Math.max(arrCPUMap[iY][iX].nImpH, arrCPUMap[iY][iX].nImpV, arrCPUMap[iY][iX].nImpL, arrCPUMap[iY][iX].nImpR)))
                arrCPUMap[iY][iX].nWeight = arrCPUMap[iY][iX].nImpH + arrCPUMap[iY][iX].nImpV + arrCPUMap[iY][iX].nImpL + arrCPUMap[iY][iX].nImpR
                arrCPUMap[iY][iX].nTwoSided = (arrCPUMap[iY][iX].nImpHtwo || arrCPUMap[iY][iX].nImpVtwo || arrCPUMap[iY][iX].nImpLtwo || arrCPUMap[iY][iX].nImpRtwo)
                arrCPUMap[iY][iX].nImportance = arrCPUMap[iY][iX].nImportance * 100 + arrCPUMap[iY][iX].nWeight
                
                if (arrCPUMap[iY][iX].nTwoSided) {
                    arrCPUMap[iY][iX].nImportance++
                }
            }
        }
        
        // Kikeresi a legnagyobb értéket
        for (iX = 0; iX < this.width; iX++) {
            for (iY = 0; iY < this.height; iY++) {
                if (maxDefValue < arrCPUMap[iY][iX].nImpH || (maxDefValue === arrCPUMap[iY][iX].nImpH && arrCPUMap[iY][iX].nImpHtwo > maxDefSides)) {
                    maxDefValue = arrCPUMap[iY][iX].nImpH
                    maxDefSides = arrCPUMap[iY][iX].nImpHtwo
                    maxDefX = iX
                    maxDefY = iY
                }
                if (maxDefValue < arrCPUMap[iY][iX].nImpV || (maxDefValue === arrCPUMap[iY][iX].nImpV && arrCPUMap[iY][iX].nImpVtwo > maxDefSides)) {
                    maxDefValue = arrCPUMap[iY][iX].nImpV
                    maxDefSides = arrCPUMap[iY][iX].nImpVtwo
                    maxDefX = iX
                    maxDefY = iY
                }
                if (maxDefValue < arrCPUMap[iY][iX].nImpL || (maxDefValue === arrCPUMap[iY][iX].nImpL && arrCPUMap[iY][iX].nImpLtwo > maxDefSides)) {
                    maxDefValue = arrCPUMap[iY][iX].nImpL
                    maxDefSides = arrCPUMap[iY][iX].nImpLtwo
                    maxDefX = iX
                    maxDefY = iY
                }
                if (maxDefValue < arrCPUMap[iY][iX].nImpR || (maxDefValue === arrCPUMap[iY][iX].nImpR && arrCPUMap[iY][iX].nImpRtwo > maxDefSides)) {
                    maxDefValue = arrCPUMap[iY][iX].nImpR
                    maxDefSides = arrCPUMap[iY][iX].nImpRtwo
                    maxDefX = iX
                    maxDefY = iY
                }
                // a weight a legnagyobb importance-n belüliek közül válogat majd
            }
        }
        
        //// TÁMADÁS - BŐVÍTÉS
        /////////////////////////////////////////////////////////////////////////////////////////////////
        
        // CPU Map kiürítése
        arrCPUMap = this.getEmptyCpuMap();
        
        // Check horizontally
        for (iY = 0; iY < this.height; iY++) {
            foundPlayer = 0
            foundMarks = 0
            firstFound = -1
            
            for (iX = 0; iX < this.width; iX++) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (board[iY][iX] !== PLAYER_ID_HUMAN) {
                        arrCPUMap[iY][iX].nImpH = foundMarks
                        
                        if (foundMarks > 0) {
                            if (firstFound === -1) {
                                arrCPUMap[iY][iX].nImpHtwo++
                            } else {
                                arrCPUMap[iY][iX].nImpHtwo++
                                arrCPUMap[iY][firstFound].nImpHtwo++
                            }
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFound = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iX === 0) {
                            firstFound = -1
                        } else {
                            if (board[iY][iX - 1] === PLAYER_ID_HUMAN) {
                                firstFound = -1
                            } else {
                                firstFound = iX - 1
                                arrCPUMap[iY][firstFound].nImpH++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFound > -1) {
                            arrCPUMap[iY][firstFound].nImpH++
                        }
                    }
                }
            }
        }
        
        // Check vertically
        for (iX = 0; iX < this.width; iX++) {
            foundPlayer = 0
            foundMarks = 0
            firstFound = -1
            
            for (iY = 0; iY < this.height; iY++) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (board[iY][iX] !== PLAYER_ID_HUMAN) {
                        arrCPUMap[iY][iX].nImpV += foundMarks
                        
                        if (foundMarks > 0) {
                            if (firstFound === -1) {
                                arrCPUMap[iY][iX].nImpVtwo++
                            } else {
                                arrCPUMap[iY][iX].nImpVtwo++
                                arrCPUMap[firstFound][iX].nImpVtwo++
                            }
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFound = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iY === 0) {
                            firstFound = -1
                        } else {
                            if (board[iY - 1][iX] === PLAYER_ID_HUMAN) {
                                firstFound = -1
                            } else {
                                firstFound = iY - 1
                                arrCPUMap[firstFound][iX].nImpV++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFound > -1) {
                            arrCPUMap[firstFound][iX].nImpV++
                        }
                    }
                }
            }
        }
        
        // átlósan / bal-lentről jobb-felfele
        iStartX = 0
        iStartY = this.victoryCondition - 1
        iX = iStartX
        iY = iStartY
        
        while (iX < this.width || iY < this.height - this.victoryCondition - 1) {
            iX = iStartX
            iY = iStartY
            foundPlayer = 0
            foundMarks = 0
            firstFoundX = -1
            firstFoundY = -1
            
            while (iX < this.width && iY >= 0) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (board[iY][iX] !== PLAYER_ID_HUMAN) {
                        arrCPUMap[iY][iX].nImpR += foundMarks
                        
                        if (foundMarks > 0) {
                            if (firstFoundX === -1) {
                                arrCPUMap[iY][iX].nImpRtwo++
                            } else {
                                arrCPUMap[iY][iX].nImpRtwo++
                                arrCPUMap[firstFoundY][firstFoundX].nImpRtwo++
                            }
                        }
                    }
                    foundPlayer = 0
                    foundMarks = 0
                    firstFoundX = -1
                    firstFoundY = -1
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX]
                        foundMarks = 1
                        
                        if (iX === 0 || iY === this.height - 1) {
                            firstFoundX = -1
                            firstFoundY = -1
                        } else {
                            if (board[iY + 1][iX - 1] === PLAYER_ID_HUMAN) {
                                firstFoundX = -1
                                firstFoundY = -1
                            } else {
                                firstFoundX = iX - 1
                                firstFoundY = iY + 1
                                arrCPUMap[firstFoundY][firstFoundX].nImpR++
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFoundX > -1) {
                            arrCPUMap[firstFoundY][firstFoundX].nImpR++
                        }
                    }
                }
                iX++;
                iY--;
            }
            
            if (iStartY < this.height - 1) {
                iStartY++;
            } else {
                iStartX++;
            }
        }
        
        // átlósan \ bal-fentről jobb-lefele
        iStartX = 0;
        iStartY = this.height - this.victoryCondition;
        iX = iStartX;
        iY = iStartY;
        
        while (iX < this.width || iY > this.victoryCondition) {
            iX = iStartX;
            iY = iStartY;
            foundPlayer = 0;
            foundMarks = 0;
            firstFoundX = -1;
            firstFoundY = -1;
            
            while (iX < this.width && iY < this.height) {
                if (board[iY][iX] === 0 || board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (board[iY][iX] !== PLAYER_ID_HUMAN) {
                        arrCPUMap[iY][iX].nImpL += foundMarks;
                        
                        if (foundMarks > 0) {
                            if (firstFoundX === -1) {
                                arrCPUMap[iY][iX].nImpLtwo++;
                            } else {
                                arrCPUMap[iY][iX].nImpLtwo++;
                                arrCPUMap[firstFoundY][firstFoundX].nImpLtwo++;
                            }
                        }
                    }
                    foundPlayer = 0;
                    foundMarks = 0;
                    firstFoundX = -1;
                    firstFoundY = -1;
                } else {
                    if (board[iY][iX] !== foundPlayer) {
                        foundPlayer = board[iY][iX];
                        foundMarks = 1;
                        
                        if (iX === 0 || iY === 0) {
                            firstFoundX = -1;
                            firstFoundY = -1;
                        } else {
                            if (board[iY - 1][iX - 1] === PLAYER_ID_HUMAN) {
                                firstFoundX = -1;
                                firstFoundY = -1;
                            } else {
                                firstFoundX = iX - 1;
                                firstFoundY = iY - 1;
                                arrCPUMap[firstFoundY][firstFoundX].nImpL++;
                            }
                        }
                    } else {
                        foundMarks++;
                        if (firstFoundX > -1) {
                            arrCPUMap[firstFoundY][firstFoundX].nImpL++;
                        }
                    }
                }
                iX++;
                iY++;
            }
            
            if (iStartY > 0) {
                iStartY--;
            } else {
                iStartX++;
            }
        }
        
        //// Keres és kitöröl reménytelen sorokat (ahova hiába rak úgysem jönne ki)
        //////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        // Check horizontally
        for (iY = 0; iY < this.height; iY++) {
            foundMarks = 0;
            firstFound = 0;
            
            for (iX = 0; iX < this.width; iX++) {
                if (board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                        for (var i = firstFound; i < iX; i++) {
                            arrCPUMap[iY][i].nImpH = 0;
                            arrCPUMap[iY][i].nImpHtwo = 0;
                        }
                    }
                    foundMarks = 0;
                    firstFound = -1;
                } else {
                    if (firstFound === -1) firstFound = iX
                    foundMarks++;
                }
            }
            if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                for (let i = firstFound; i < iX; i++) {
                    arrCPUMap[iY][i].nImpH = 0
                    arrCPUMap[iY][i].nImpHtwo = 0
                }
            }
        }
        
        // Check vertically
        for (iX = 0; iX < this.width; iX++) {
            foundMarks = 0
            firstFound = 0
            
            for (iY = 0; iY < this.height; iY++) {
                if (board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                        for (i = firstFound; i < iY; i++) {
                            arrCPUMap[i][iX].nImpV = 0
                            arrCPUMap[i][iX].nImpVtwo = 0
                        }
                    }
                    foundMarks = 0
                    firstFound = -1
                } else {
                    if (firstFound === -1) firstFound = iY
                    foundMarks++;
                }
            }
            if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                for (i = firstFound; i < iY; i++) {
                    arrCPUMap[i][iX].nImpV = 0
                    arrCPUMap[i][iX].nImpVtwo = 0
                }
            }
        }
        
        // átlósan / bal-lentről jobb-felfele
        iStartX = 0
        iStartY = this.victoryCondition - 1
        iX = iStartX
        iY = iStartY
        
        while (iX < this.width || iY < this.height - this.victoryCondition - 1) {
            iX = iStartX
            iY = iStartY
            foundMarks = 0
            firstFoundX = iStartX
            firstFoundY = iStartY
            
            while (iX < this.width && iY >= 0) {
                if (board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                        for (i = 0; i < iX - firstFoundX; i++) {
                            arrCPUMap[firstFoundY - i][firstFoundX + i].nImpR = 0
                            arrCPUMap[firstFoundY - i][firstFoundX + i].nImpRtwo = 0
                        }
                    }
                    foundMarks = 0
                    firstFoundX = -1
                    firstFoundY = -1
                } else {
                    if (firstFoundX === -1) {
                        firstFoundX = iX
                        firstFoundY = iY
                    }
                    foundMarks++;
                    
                }
                iX++
                iY--
            }
            if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                for (i = 0; i < iX - firstFoundX; i++) {
                    arrCPUMap[firstFoundY - i][firstFoundX + i].nImpR = 0
                    arrCPUMap[firstFoundY - i][firstFoundX + i].nImpRtwo = 0
                }
            }
            if (iStartY < this.height - 1) {
                iStartY++
            } else {
                iStartX++
            }
        }
        
        // átlósan \ bal-fentről jobb-lefele
        iStartX = 0
        iStartY = this.height - this.victoryCondition
        iX = iStartX
        iY = iStartY
        
        while (iX < this.width || iY > this.victoryCondition) {
            iX = iStartX
            iY = iStartY
            foundMarks = 0
            firstFoundX = iStartX
            firstFoundY = iStartY
            
            while (iX < this.width && iY < this.height) {
                if (board[iY][iX] === PLAYER_ID_HUMAN) {
                    if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                        for (i = 0; i < iX - firstFoundX; i++) {
                            arrCPUMap[firstFoundY + i][firstFoundX + i].nImpL = 0
                            arrCPUMap[firstFoundY + i][firstFoundX + i].nImpLtwo = 0
                        }
                    }
                    foundMarks = 0
                    firstFoundX = -1
                    firstFoundY = -1
                } else {
                    if (firstFoundX === -1) {
                        firstFoundX = iX
                        firstFoundY = iY
                    }
                    foundMarks++;
                }
                iX++
                iY++
            }
            if (foundMarks > 0 && foundMarks < this.victoryCondition) {
                for (i = 0; i < iX - firstFoundX; i++) {
                    arrCPUMap[firstFoundY + i][firstFoundX + i].nImpL = 0
                    arrCPUMap[firstFoundY + i][firstFoundX + i].nImpLtwo = 0
                }
            }
            if (iStartY > 0) {
                iStartY--
            } else {
                iStartX++
            }
        }
        
        // Összegezi az eredményeket egy számba
        for (iX = 0; iX < this.width; iX++) {
            for (iY = 0; iY < this.height; iY++) {
                // a legnagyobb érték marad meg, az összes összege pedig lesz a weight (habár az még mindig nem 100-as igy)
                // az összeadós megoldás egyszerűen nem jó
                arrCPUMap[iY][iX].nImportance = Math.max(Math.max(Math.max(arrCPUMap[iY][iX].nImpH, arrCPUMap[iY][iX].nImpV, arrCPUMap[iY][iX].nImpL, arrCPUMap[iY][iX].nImpR)))
                arrCPUMap[iY][iX].nWeight = arrCPUMap[iY][iX].nImpH + arrCPUMap[iY][iX].nImpV + arrCPUMap[iY][iX].nImpL + arrCPUMap[iY][iX].nImpR
                arrCPUMap[iY][iX].nTwoSided = (arrCPUMap[iY][iX].nImpHtwo || arrCPUMap[iY][iX].nImpVtwo || arrCPUMap[iY][iX].nImpLtwo || arrCPUMap[iY][iX].nImpRtwo)
                arrCPUMap[iY][iX].nSides = Math.max(arrCPUMap[iY][iX].nImpHtwo, Math.max(arrCPUMap[iY][iX].nImpVtwo, Math.max(arrCPUMap[iY][iX].nImpLtwo, arrCPUMap[iY][iX].nImpRtwo)))
                arrCPUMap[iY][iX].nImportance = arrCPUMap[iY][iX].nImportance * 100 + arrCPUMap[iY][iX].nWeight
                
                if (arrCPUMap[iY][iX].nTwoSided) {
                    arrCPUMap[iY][iX].nImportance++
                }
            }
        }
        
        // Kikeresi a legnagyobb értéket
        for (iX = 0; iX < this.width; iX++) {
            for (iY = 0; iY < this.height; iY++) {
                if (maxExpValue < arrCPUMap[iY][iX].nImpH || (maxExpValue === arrCPUMap[iY][iX].nImpH && arrCPUMap[iY][iX].nImpHtwo > maxExpSides)) {
                    maxExpValue = arrCPUMap[iY][iX].nImpH
                    maxExpSides = arrCPUMap[iY][iX].nImpHtwo
                    maxExpX = iX
                    maxExpY = iY
                }
                if (maxExpValue < arrCPUMap[iY][iX].nImpV || (maxExpValue === arrCPUMap[iY][iX].nImpV && arrCPUMap[iY][iX].nImpVtwo > maxExpSides)) {
                    maxExpValue = arrCPUMap[iY][iX].nImpV
                    maxExpSides = arrCPUMap[iY][iX].nImpVtwo
                    maxExpX = iX
                    maxExpY = iY
                }
                if (maxExpValue < arrCPUMap[iY][iX].nImpL || (maxExpValue === arrCPUMap[iY][iX].nImpL && arrCPUMap[iY][iX].nImpLtwo > maxExpSides)) {
                    maxExpValue = arrCPUMap[iY][iX].nImpL
                    maxExpSides = arrCPUMap[iY][iX].nImpLtwo
                    maxExpX = iX
                    maxExpY = iY
                }
                if (maxExpValue < arrCPUMap[iY][iX].nImpR || (maxExpValue === arrCPUMap[iY][iX].nImpR && arrCPUMap[iY][iX].nImpRtwo > maxExpSides)) {
                    maxExpValue = arrCPUMap[iY][iX].nImpR
                    maxExpSides = arrCPUMap[iY][iX].nImpRtwo
                    maxExpX = iX
                    maxExpY = iY
                }
                // a weight a legnagyobb importance-n belüliek közül válogat majd
            }
        }
        
        //// ELDÖNTI HOGY MIT LÉPJEN
        /////////////////////////////////////////////////////////////////////////////////////////////////
        
        if (maxExpValue >= 4) {
            cpuTaskId = 2
            
        } else if (
            (maxDefValue >= 3 && arrCPUMap[maxDefY][maxDefX].nImpHtwo >= 2) ||
            (maxDefValue >= 3 && arrCPUMap[maxDefY][maxDefX].nImpVtwo >= 2) ||
            (maxDefValue >= 3 && arrCPUMap[maxDefY][maxDefX].nImpLtwo >= 2) ||
            (maxDefValue >= 3 && arrCPUMap[maxDefY][maxDefX].nImpRtwo >= 2)) // Eldönti hogy védekezzen-e
        {
            cpuTaskId = 1
            
        } else if (
            (maxExpValue >= 3 && arrCPUMap[maxExpY][maxExpX].nImpHtwo >= 2) ||
            (maxExpValue >= 3 && arrCPUMap[maxExpY][maxExpX].nImpVtwo >= 2) ||
            (maxExpValue >= 3 && arrCPUMap[maxExpY][maxExpX].nImpLtwo >= 2) ||
            (maxExpValue >= 3 && arrCPUMap[maxExpY][maxExpX].nImpRtwo >= 2))
        {
            cpuTaskId = 2
            
        } else {
            if (maxDefValue >= 3) { // Eldönti hogy védekezzen-e
                cpuTaskId = 1
                
            } else if (maxExpValue >= 1) { // Eldönti hogy bővítsen-e
                cpuTaskId = 2
            }
        }
        
        switch (cpuTaskId) {
        case 1:
            console.log("CPU: Defend (" + maxDefX + "; " + maxDefY + ")");
            return { x: maxDefX, y: maxDefY };
            
        case 2:
            console.log("CPU: Attack (" + maxExpX + "; " + maxExpY + ")");
            return { x: maxExpX, y: maxExpY };
            
        default:
            if (maxDefX === -1 || maxDefY === -1) {
                maxDefX = Math.round(this.width / 2)
                maxDefY = Math.round(this.height / 2)
            }
            console.log("CPU: Initiate (" + maxDefX + "; " + maxDefY + ")");
            return { x: maxDefX, y: maxDefY };
        }
    }
}