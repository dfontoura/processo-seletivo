       
        const myForm = document.getElementById('myform');

        myForm.onsubmit = function (command) {
            command.preventDefault();
            makeRequest();
        }


        function makeRequest(){
                     
            var data = {
                

                container: {
                        width: parseInt(document.getElementById('cwidth').value),
                        length: parseInt(document.getElementById('clength').value),
                        height: parseInt(document.getElementById('cheight').value)
                },
                boxTypes: [ {
                    id: 0,
                    name: 'Caixa 1',
                    width: parseInt(document.getElementById('b1width').value),
                    length: parseInt(document.getElementById('b1length').value),
                    height: parseInt(document.getElementById('b1height').value),
                    initialQuantity: parseInt(document.getElementById('b1quantity').value)
                }, {
                    id: 1,
                    name: 'Caixa 2',
                    width: parseInt(document.getElementById('b2width').value),
                    length: parseInt(document.getElementById('b2length').value),
                    height: parseInt(document.getElementById('b2height').value),
                    initialQuantity: parseInt(document.getElementById('b2quantity').value)
                } , {
                    id: 2,
                    name: 'Caixa 3',
                    width: parseInt(document.getElementById('b3width').value),
                    length: parseInt(document.getElementById('b3length').value),
                    height: parseInt(document.getElementById('b3height').value),
                    initialQuantity: parseInt(document.getElementById('b3quantity').value)
                } ]
            }


            let volumeContainer = data.container.width * data.container.length * data.container.height
            let labelVolumeContainer = document.getElementById("volume-container");
            labelVolumeContainer.innerHTML = `${volumeContainer} cm³`
            var totalBoxes = 0


            if ( Number.isNaN(data.container.width) || data.container.width < 1 ) {
                alert('Favor incluir somente números inteiros, sem decimais. Medidas em centímetros.')
                return false
            }
            if ( Number.isNaN(data.container.length) || data.container.length < 1) {
                alert('Favor incluir somente números inteiros, sem decimais. Medidas em centímetros.')
                return false
            }
            if ( Number.isNaN(data.container.height) || data.container.height < 1) {
                alert('Favor incluir somente números inteiros, sem decimais. Medidas em centímetros.')
                return false
            }
            for (boxType of data.boxTypes) {
                totalBoxes += parseInt(boxType.initialQuantity) 
                if ( Number.isNaN(boxType.width) || boxType.width < 1) {
                    alert('Favor incluir somente números inteiros, sem decimais. Medidas em centímetros.')
                    return false
                }
                if ( Number.isNaN(boxType.length) || boxType.length < 1) {
                    alert('Favor incluir somente números inteiros, sem decimais. Medidas em centímetros.')
                    return false
                }
                if ( Number.isNaN(boxType.height) || boxType.height < 1) {
                    alert('Favor incluir somente números inteiros, sem decimais. Medidas em centímetros.')
                    return false
                }
            }
            let howManyTotal = document.getElementById("how-many-total");
            howManyTotal.innerHTML = `${totalBoxes} caixas`

            window.scrollTo(0, 0)
            let divLoading = document.getElementById("div-loading");
            divLoading.style.display = 'block';
            myForm.style.display = 'none';
            var request = new XMLHttpRequest();
            var url = "http://dfontoura.vps-kinghost.net/optimize-it";
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    let solution = JSON.parse(request.responseText);
                    console.log(solution);
                    divLoading.style.display = 'none';
                    if ( solution != false ) {
                        report(solution);
                    } else location.reload()

                }

            };
            var command = JSON.stringify(data);
            request.send(command);            
        



        function report(solution){
            let reportTable = document.getElementById("report-table");
            
            let BoxesVolume = 0
            let totalEachTypeBox = [0 , 0 , 0]

            var row
            let i = 1
            for(let box of solution.boxes) {
                row = reportTable.insertRow();
                row.innerHTML += `<td>${i}</td><td>${box.name}</td><td>( ${box.x} , ${box.y} , ${box.z} )</td><td>${box.width}</td><td>${box.length}</td><td>${box.height}</td>`;
                
                BoxesVolume += data.boxTypes[box.boxTypeIndex].width * data.boxTypes[box.boxTypeIndex].height * data.boxTypes[box.boxTypeIndex].length
                
                totalEachTypeBox[box.boxTypeIndex]++
                i++
            }                         

            let volume = document.getElementById("volume");
            volume.innerHTML = `${BoxesVolume} cm³`
            let howMany = document.getElementById("how-many");
            howMany.innerHTML = `${solution.boxes.length} caixas`
            let totalBoxes1 = document.getElementById("total-1");
            let totalBoxes2 = document.getElementById("total-2");
            let totalBoxes3 = document.getElementById("total-3");
            totalBoxes1.innerHTML = `${totalEachTypeBox[0]} caixas`
            totalBoxes2.innerHTML = `${totalEachTypeBox[1]} caixas`
            totalBoxes3.innerHTML = `${totalEachTypeBox[2]} caixas`
            let boxOutside = document.getElementById("box-outside");
            boxOutside.innerHTML = `${totalBoxes - solution.boxes.length} caixas`
            let divReport = document.getElementById("div-report");
            divReport.style.display = 'block';
        }
    };
