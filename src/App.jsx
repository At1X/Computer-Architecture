import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

// basic computer assembler with microPrograms control 

const makeBinary8Bit = (num) => {
  num = parseInt(num)
  let binary = num.toString(2);
  if (binary.length < 8) {
    binary = '0'.repeat(8 - binary.length) + binary;
  }
  return binary;
};

const makeBinary7Bit = (num) => {
  num = parseInt(num)
  let binary = num.toString(2);
  if (binary.length < 7) {
    binary = '0'.repeat(7 - binary.length) + binary;
  }
  return binary;
};

const makeBinary4Bit = (num) => {
  num = parseInt(num)
  let binary = num.toString(2);
  if (binary.length < 4) {
    binary = '0'.repeat(4 - binary.length) + binary;
  }
  return binary;
};

const makeBinaryNBit = (num, n) => {
  num = parseInt(num)
  let binary = num.toString(2);
  if (binary.length < n) {
    binary = '0'.repeat(n - binary.length) + binary;
  }
  return binary;
};


const findCodeFromName = (name, array) => {
  if (name) {
    const code = array.find((item) => item.name === name);
    return code;
  }
};


const makeHex = (num, base) => {
  num = parseInt(num, base)
  let hex = num.toString(16);
    hex = '0x' + hex;
  return hex;
};


const decodeVars = (type, number) => {
  if (type === 'DEC') {
    return makeBinaryNBit(number, 16);
  } else if (type === 'HEX') {
    const num = parseInt(number, 16);
    return makeBinaryNBit(num, 16);
  }
};


function formatString(inputString, lengths) {
  if (inputString) {
    const groupLengths = lengths; // Lengths of each group
    let formattedString = "";
    let currentIndex = 0;

    // Iterate over each group length
    for (const length of groupLengths) {
      const group = inputString.substr(currentIndex, length); // Extract the current group
      formattedString += group + "-"; // Append the group to the formatted string
      currentIndex += length; // Move the current index forward
    }

    // Remove the trailing dash
    formattedString = formattedString.slice(0, -1);

    return formattedString;
  }
  else {
    return ''
  }
}

const MiniComputer = () => {
  const memoryLengthGroup = [1, 4, 11];
  const contrlMemoryLengthGroup = [3, 3, 3, 2, 2, 7];
  const enteredCode = useRef(null);
  const controlCode = useRef(null);
  const [output, setOutput] = useState(null);
  const [memory, setMemory] = useState([]);
  const [controlMemory, setControlMemory] = useState([]);
  const [accumulator, setAccumulator] = useState("0");
  const [programCounter, setProgramCounter] = useState("0");
  const [addressRegister, setAddressRegister] = useState("0");
  const [dataRegister, setDataRegister] = useState("0");
  const [CAR, setCAR] = useState("1000000");
  const [SBR, setSBR] = useState("0");
  const [isRunning, setIsRunning] = useState(false);
  const [microOperationCode, setMicroOperationCode] = useState("");

  const BR_JMP = (cndt, code) => {
    if (cndt) {
    setCAR(code); // CHECK THIS PLACE
    }

    else {
      setCAR(prvCAR => 
        {
          const decimalPrvCAR = parseInt(prvCAR, 2);
          return makeBinaryNBit(decimalPrvCAR + 1, 7);
        });
    }
  }

  const BR_CALL = (cndt, code) => {
    if (cndt) {
      setSBR(
        (prv) => {
          const decimalPrvCAR = parseInt(CAR, 2);
          return makeBinaryNBit(decimalPrvCAR + 1, 7);
        }
      );
      console.log(code);
      setCAR(code);
    }

    else {
      setCAR(prvCAR =>
        {
          const decimalPrvCAR = parseInt(prvCAR, 2);
          return makeBinaryNBit(decimalPrvCAR + 1, 7);
        });
    }
  }


  const BR_RET = () => {
    setCAR(SBR);
  }


  const BR_MAP = () => {
    let newCAR = dataRegister.slice(1, 5);
    newCAR = '0' + newCAR + '00';
    setCAR(newCAR);
  }


  const CD_I = () => {
    return dataRegister[0] == '1';
  }

  const CD_S = () => {
    return accumulator[0] == '1';
  }

  const CD_Z = () => {
    return parseInt(accumulator) == 0;
  }

  // @@@@@@@@@@@@@@@@@@@@ FUNCTIONALITY FOR Micro Operations @@@@@@@@@@@@@@@@@@@@@@

  const F1_ADD = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = decimalDataRegister + prvAccumulator;
      return makeBinaryNBit(result, 16);
    });
  }

  const F1_CLRAC = () => {
    setAccumulator('0000000000000000');
  }

  const F1_INCAC = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const result = prvAccumulator + 1;
      return makeBinaryNBit(result, 16);
    });
  }

  const F1_DRTAC = () => {
    setAccumulator(dataRegister);
  }

  const F1_DRTAR = () => {
    setAddressRegister(dataRegister.slice(5, 16));
  }

  const F1_PCTAR = () => {
    setAddressRegister(programCounter);
  }

  const F1_WRITE = () => {
      const copyOfMemory = {...memory};
      const decimalAddressRegister = parseInt(addressRegister, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      console.log(copyOfMemory);
      copyOfMemory[decimalAddressRegister].content = makeBinaryNBit(decimalDataRegister, 16); // INJA RO SHAK DARAM
      console.log(copyOfMemory);
      setMemory(copyOfMemory);
  }

  const F2_SUB = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator - decimalDataRegister;
      return makeBinaryNBit(result, 16);
    });
  }

  const F2_OR = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator | decimalDataRegister;
      return makeBinaryNBit(result, 16);
    });
  }

  const F2_AND = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator & decimalDataRegister;
      return makeBinaryNBit(result, 16);
    });
  }

  const F2_READ = () => {
    setDataRegister(prvDataRegister => {
      const decimalAddressRegister = parseInt(addressRegister, 2);
      const result = memory[decimalAddressRegister].content;
      return result;
    });
  }

  const F2_ACTDR = () => {
    setDataRegister(accumulator);
  }

  const F2_INCDR = () => {
    setDataRegister(prvDataRegister => {
      prvDataRegister = parseInt(prvDataRegister, 2);
      const result = prvDataRegister + 1;
      return makeBinaryNBit(result, 16);
    });
  }

  const F2_PCTDR = () => {
    if (programCounter.length !== 11)
      console.log("YECHIZI INJA GHALATE");
    setDataRegister(programCounter);
  }


  const F3_XOR = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator ^ decimalDataRegister;
      return makeBinary8Bit(result);
    });
  }

  const F3_COM = () => {
    setAccumulator(prvAccumulator => {
      let myStr = '';
      for (let i = 0; i < prvAccumulator.length; i++) {
        if (prvAccumulator[i] === '0')
          myStr += '1';
        else
          myStr += '0';
      }
      return myStr;
    });
  }

  const F3_SHL = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const result = prvAccumulator << 1;
      return makeBinary8Bit(result);
    });
  }

  const F3_SHR = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const result = prvAccumulator >> 1;
      return makeBinary8Bit(result);
    });
  }

  const F3_INCPC = () => {
    setProgramCounter(prvProgramCounter => {
      prvProgramCounter = parseInt(prvProgramCounter, 2);
      const result = prvProgramCounter + 1;
      return makeBinaryNBit(result, 11);
    });
  }

  const F3_ARTPC = () => {
    setProgramCounter(addressRegister);
  }


  const F1 = [
    { name: 'NOP', code: '000', action: () => { } },
    { name: 'ADD', code: '001', action: F1_ADD },
    { name: 'CLRAC', code: '010', action: F1_CLRAC },
    { name: 'INCAC', code: '011', action: F1_INCAC },
    { name: 'DRTAC', code: '100', action: F1_DRTAC },
    { name: 'DRTAR', code: '101', action: F1_DRTAR },
    { name: 'PCTAR', code: '110', action: F1_PCTAR },
    { name: 'WRITE', code: '111', action: F1_WRITE },
  ]
  const F2 = [
    { name: 'NOP', code: '000', action: () => { } },
    { name: 'SUB', code: '001', action: F2_SUB },
    { name: 'OR', code: '010', action: F2_OR },
    { name: 'AND', code: '011', action: F2_AND },
    { name: 'READ', code: '100', action: F2_READ },
    { name: 'ACTDR', code: '101', action: F2_ACTDR },
    { name: 'INCDR', code: '110', action: F2_INCDR },
    { name: 'PCTDR', code: '111', action: F2_PCTDR },
  ]

  const F3 = [
    { name: 'NOP', code: '000', action: () => { } },
    { name: 'XOR', code: '001', action: F3_XOR },
    { name: 'COM', code: '010', action: F3_COM },
    { name: 'SHL', code: '011', action: F3_SHL },
    { name: 'SHR', code: '100', action: F3_SHR },
    { name: 'INCPC', code: '101', action: F3_INCPC },
    { name: 'ARTPC', code: '110', action: F3_ARTPC },
    { name: 'RESERVED', code: '111', action: () => { } },
  ]

  const merged_Fs = [
    { name: 'NOP', code: '000', action: () => { }, F: 1 },
    { name: 'ADD', code: '001', action: F1_ADD, F: 1 },
    { name: 'CLRAC', code: '010', action: F1_CLRAC, F: 1 },
    { name: 'INCAC', code: '011', action: F1_INCAC, F: 1 },
    { name: 'DRTAC', code: '100', action: F1_DRTAC, F: 1 },
    { name: 'DRTAR', code: '101', action: F1_DRTAR, F: 1 },
    { name: 'PCTAR', code: '110', action: F1_PCTAR , F: 1},
    { name: 'WRITE', code: '111', action: F1_WRITE, F: 1 },
    { name: 'NOP', code: '000', action: () => { }, F: 2 },
    { name: 'SUB', code: '001', action: F2_SUB, F: 2 },
    { name: 'OR', code: '010', action: F2_OR, F: 2 },
    { name: 'AND', code: '011', action: F2_AND, F: 2 },
    { name: 'READ', code: '100', action: F2_READ, F: 2 },
    { name: 'ACTDR', code: '101', action: F2_ACTDR, F: 2 },
    { name: 'INCDR', code: '110', action: F2_INCDR, F: 2 },
    { name: 'PCTDR', code: '111', action: F2_PCTDR, F: 2 },
    { name: 'NOP', code: '000', action: () => { }, F: 3 },
    { name: 'XOR', code: '001', action: F3_XOR, F: 3 },
    { name: 'COM', code: '010', action: F3_COM, F: 3 },
    { name: 'SHL', code: '011', action: F3_SHL, F: 3 },
    { name: 'SHR', code: '100', action: F3_SHR, F: 3 },
    { name: 'INCPC', code: '101', action: F3_INCPC, F: 3 },
    { name: 'ARTPC', code: '110', action: F3_ARTPC, F: 3 },
    { name: 'RESERVED', code: '111', action: () => { }, F: 3 },
  ]

  const all_CD = [
    { name: "U", code: "00", action: () => { return true } },
    { name: "I", code: "01", action: CD_I },
    { name: "S", code: "10", action: CD_S },
    { name: "Z", code: "11", action: CD_Z },
  ]

  const all_BR = [
    { name: "JMP", code: "00", action: (cndt, code) => BR_JMP(cndt, code) },
    { name: "CALL", code: "01", action: (cndt, code) => BR_CALL(cndt, code) },
    { name: "RET", code: "10", action: (cndt) => BR_RET(cndt) },
    { name: "MAP", code: "11", action: (cndt) => BR_MAP(cndt) },
  ]

  const CD = [
    { name: "U", code: "00" },
    { name: "I", code: "01" },
    { name: "S", code: "10" },
    { name: "Z", code: "11" },
  ]

  const BRANCH = [
    { name: "JMP", code: "00" },
    { name: "CALL", code: "01" },
    { name: "RET", code: "10" },
    { name: "MAP", code: "11" },
  ]


  // fill memory at first initialization with null values
  useEffect(() => {
    setMemory((prev) => {
      const newMemory = { ...prev };
      for (let i = 0; i < 1024; i++) {
        newMemory[i] = {
          address: '',
          instruction: '',
          label: '',
        };
      }
      return newMemory;
    });
  }, []);

  useEffect(() => {
    setControlMemory((prev) => {
      const newControlMemory = { ...prev };
      for (let i = 0; i < 128; i++) {
        newControlMemory[i] = {
          address: '',
          instruction: '',
          label: '',
        };
      }
      return newControlMemory;
    });
  }, []);



  const controlTextSubmitted = () => {
    const controlText = controlCode.current.value;
    const controlLines = controlText.split('\n');
    let firstF1;
    let firstF2;
    let firstF3;
    let addressNumberInMemory = 0;
    let labelAdr = 0;
    const updateArray = [];
    const labelAddresses = [];

    // asign labels with their addresses
    controlLines.map((line) => {
      const [ORG, NUMBER] = line.split(" ")
      if (ORG === "ORG") {
        labelAdr = parseInt(NUMBER);
      }
      else {
        const labelArr = line.split(': ');
        let label = '';
        if (labelArr.length > 1) {
          label = labelArr[0];
          if (label !== '') {
            labelAddresses.push({ label: label, labelAdr: labelAdr });
          }
        }
          labelAdr++;
      }
    })


    controlLines.map((line) => {
      firstF1 = "000";
      firstF2 = "000";
      firstF3 = "000";
      let theBR = 0;
      let theCD = 0;
      let theAddress = 0;
      const newLine = line.split(': ');
      const label = newLine.length > 1 ? newLine[0] : '';
      const myline = newLine.length > 1 ? newLine[1] : newLine[0];
      const [instruction, cd, br, address] = myline.split(' ');
      if (instruction === 'ORG') {
        addressNumberInMemory = parseInt(cd)
      }
      else if (instruction === 'END') {        
      }
      else {
        theBR = findCodeFromName(br, BRANCH).code;
        theCD = findCodeFromName(cd, CD).code;
        if (address === "NEXT") {
          theAddress = addressNumberInMemory + 1;
        }
        else if (address === undefined) {
          theAddress = 0;
        }
        else {
          theAddress = labelAddresses.find((elem) => elem.label === address).labelAdr;
        }

        instruction.split(',').map((elem, index) => {
          const theF = findCodeFromName(elem, merged_Fs);
            if (theF.F === 1) {
              firstF1 = theF.code;
            }
            else if (theF.F === 2) {
              firstF2 = theF.code;
            }
            else if (theF.F === 3) {
              firstF3 = theF.code;
            }
        });
        updateArray.push( {F1:firstF1, F2:firstF2, F3:firstF3, theCD:theCD, theBR:theBR, addr:addressNumberInMemory, label:label, nextLineAddr: makeBinary7Bit(theAddress)});
        addressNumberInMemory++;
        console.log(line);
        }
    });
    const newCntrlMemory = {...controlMemory};
    updateArray.map((elem) => {
      newCntrlMemory[elem.addr] = {
        content: elem.F1 + elem.F2 + elem.F3 + elem.theCD + elem.theBR + elem.nextLineAddr,
        hexContent: makeHex(elem.F1 + elem.F2 + elem.F3 + elem.theCD + elem.theBR + elem.nextLineAddr, 2),
        label: elem.label,
        instruction: "",
      }
    })
    setControlMemory(newCntrlMemory);
  }

  const addCodeToMemory = () => {
    const codeText = enteredCode.current.value;
    const codeTextLines = codeText.split('\n');
    const variables = [];
    const contentList = [];
    let memoryAddressNumber = 0;
    let addressNumberLables = 0;
    codeTextLines.map((line) => {
      const newLine = line.split(' ');
      if (newLine[0] === 'ORG') {
        addressNumberLables = parseInt(newLine[1]);
      }
      else {
        const newLine2 = line.split(', ');
        const label = newLine2.length > 1 ? newLine2[0] : '';
        const myline = newLine2.length > 1 ? newLine2[1] : newLine2[0];
        if (label !== '') {
          // console.log(myline);
          const decodeLine = myline.split(' ');
          variables.push({ label: label, address: addressNumberLables, value: decodeVars(decodeLine[0], decodeLine[1]) });
        }
        addressNumberLables++;
      }
    })
    console.log(variables);


    codeTextLines.map((line) => {
      const sepratedLine = line.split(',');
      let label = '';
      label = sepratedLine.length > 1 ? sepratedLine[0] : '';
      const myline = sepratedLine.length > 1 ? sepratedLine[1] : sepratedLine[0];
      if (label === '') {
        const [instruction, varAddress, isIndrct] = myline.split(' ');
        
        if (instruction === 'ORG') {
          memoryAddressNumber = parseInt(varAddress);
        }
        else {

          if (varAddress) {
            const contentObject = {}
            for (let i = 0; i < 127; i++) {
              if (controlMemory[i].label === instruction) {
                contentObject['instruction'] = makeBinary4Bit(i/4);
                contentObject['addr'] = makeBinaryNBit(variables.find((elem) => elem.label === varAddress).address, 11);
                contentObject['indrct'] = isIndrct === 'I' ? '1' : '0';
                contentObject['addressInMemory'] = memoryAddressNumber;
                contentList.push(contentObject);
                break;
              }
            }
          }
          else {
            const contentObject = {}
            for (let i = 0; i < 127; i++) {
              if (controlMemory[i].label === instruction) {
                contentObject['instruction'] = makeBinary4Bit(i/4);
                contentObject['addr'] = makeBinaryNBit(0, 11);
                contentObject['indrct'] = '0';
                contentObject['addressInMemory'] = memoryAddressNumber;
                contentList.push(contentObject);
                break;
              }
            }
          }
          memoryAddressNumber++;
        }
      }
    }
    )
    const newMemory = {...memory};
    contentList.map((elem) => {
      newMemory[elem.addressInMemory] = {
        content:  elem.indrct  + elem.instruction + elem.addr,
        hexContent: makeHex(elem.indrct + elem.instruction + elem.addr, 2),
        label: "",
        instruction: "",
      }
    }
    )
    variables.map((elem) => {
      newMemory[elem.address] = {
        content: elem.value,
        hexContent: "",
        label: elem.label,
        instruction: "",
      }
    }
    )
    setMemory(newMemory);
  } 


  const compileCode = () => {
    // while (programCounter < 1024) {
      let conditionIsHappened = false;
      console.log(CAR);
      const shouldRunLine = controlMemory[parseInt(CAR, 2)].content;
      const [F1, F2, F3, CD, BR, nextLineAddr] = formatString(shouldRunLine, contrlMemoryLengthGroup).split('-');
      // console.log(F1, F2, F3, CD, BR, nextLineAddr);
      merged_Fs.map((elem) => {
        if ((elem.code === F1 && elem.F === 1) || (elem.code === F2 && elem.F === 2) || (elem.code === F3 && elem.F === 3)) {
          console.log(elem);
          elem.action();
        }
      })
      all_CD.map((elem) => {
        if (elem.code === CD) {
          conditionIsHappened = elem.action();
          // console.log(`NOW: ${conditionIsHappened}`);
        }
      })

      all_BR.map((elem) => {
        if (elem.code === BR && (elem.name === 'CALL' || elem.name === "JMP")) {
          elem.action(conditionIsHappened, nextLineAddr);
        }
        else if (elem.code === BR) {
          elem.action();
        }
      })
      
  // }
}

  return (
    <div>
      <div className='textAreas'>
        <div className='input-sides'>
          <h1>Mini Computer Program</h1>
          <textarea className='controlStyle' ref={enteredCode}></textarea>
          <button className='buttons' onClick={addCodeToMemory}>Add to memory</button>
          <button className='buttons' onClick={compileCode}>Compile</button>
        </div>
        <div className='input-sides'>
          <h1>Control</h1>
          <textarea className='controlStyle' ref={controlCode}></textarea>
          <button className='buttons' onClick={controlTextSubmitted}>Submit Control</button>
        </div>
      </div>
      {output && <p>Output: {output}</p>}
      <p>AC: {accumulator}</p>
      <p>PC: {programCounter}</p>
      <p>AR: {addressRegister}</p>
      <p>DR: {dataRegister}</p>
      <p>CAR: {CAR}</p>
      <p>SBR: {SBR}</p>
      <div className='memory-tables'>
      <table className='styled-table'>
        <thead>
          <tr>
            <th>Address</th>
            <th>Hex Address</th>
            <th>Content</th>
            <th>Label</th>
            <th>Hex Content</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(controlMemory).map((key) => {
            return (
              <tr key={key}>
                <td>{key}</td>
                <td>{makeHex(key, 10)}</td>
                <td>{formatString(controlMemory[key].content, [3, 3, 3, 2, 2, 7])}</td>
                <td>{controlMemory[key].label}</td>
                <td>{controlMemory[key].hexContent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <table className='styled-table'>
        <thead>
          <tr>
            <th>Address</th>
            <th>Hex Address</th>
            <th>label</th>
            <th>Content</th>
            <th>Hex Content</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(memory).map((key) => {
            return (
              <tr key={key}>
                <td>{key}</td>
                <td>{makeHex(key, 10)}</td>
                <td>{memory[key].label}</td>
                <td>{formatString(memory[key].content, [1, 4, 11])}</td>
                <td>{memory[key].hexContent}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      <p></p>
    </div>
  );
};
export default MiniComputer;
