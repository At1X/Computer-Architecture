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



const MiniComputer = () => {
  const enteredCode = useRef(null);
  const controlCode = useRef(null);
  const [output, setOutput] = useState(null);
  const [memory, setMemory] = useState([]);
  const [controlMemory, setControlMemory] = useState([]);
  const [accumulator, setAccumulator] = useState("");
  const [programCounter, setProgramCounter] = useState("");
  const [addressRegister, setAddressRegister] = useState("");
  const [dataRegister, setDataRegister] = useState("");
  const [CAR, setCAR] = useState("");
  const [SBR, setSBR] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [microOperationCode, setMicroOperationCode] = useState("");

  const BR_JMP = () => {
    // if cndt true:
    setCAR(microOperationCode.slice(14, 20));


    // if cndt false:
    setCAR(prvCAR => 
      {
        const decimalPrvCAR = parseInt(prvCAR, 2);
        decimalPrvCAR + 1;
        return makeBinary8Bit(decimalPrvCAR);
      });
  }

  const BR_CALL = () => {
    // if cndt true:
    setSBR(
      () => {
        const decimalPrvCAR = parseInt(CAR, 2);
        decimalPrvCAR + 1;
        return makeBinary8Bit(decimalPrvCAR);
      }
    );
    setCAR(microOperationCode.slice(14, 20));

    // if cndt false:
    setCAR(prvCAR =>
      {
        const decimalPrvCAR = parseInt(prvCAR, 2);
        decimalPrvCAR + 1;
        return makeBinary8Bit(decimalPrvCAR);
      });
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
    return dataRegister[0] === '1';
  }

  const CD_S = () => {
    return accumulator[0] === '1';
  }

  const CD_Z = () => {
    return accumulator === '00000000';
  }

  // @@@@@@@@@@@@@@@@@@@@ FUNCTIONALITY FOR Micro Operations @@@@@@@@@@@@@@@@@@@@@@

  const F1_ADD = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = decimalDataRegister + prvAccumulator;
      return makeBinary8Bit(result);
    });
  }

  const F1_CLRAC = () => {
    setAccumulator('00000000');
  }

  const F1_INCAC = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const result = prvAccumulator + 1;
      return makeBinary8Bit(result);
    });
  }

  const F1_DRTAC = () => {
    setAccumulator(dataRegister);
  }

  const F1_DRTAR = () => {
    setAddressRegister(dataRegister);
  }

  const F1_PCTAR = () => {
    setAddressRegister(programCounter);
  }

  const F1_WRITE = () => {
    setMemory(prvMemory => {
      const decimalAddressRegister = parseInt(addressRegister, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      prvMemory[decimalAddressRegister] = makeBinary8Bit(decimalDataRegister);
      return prvMemory;
    });
  }

  const F2_SUB = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator - decimalDataRegister;
      return makeBinary8Bit(result);
    });
  }

  const F2_OR = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator | decimalDataRegister;
      return makeBinary8Bit(result);
    });
  }

  const F2_AND = () => {
    setAccumulator(prvAccumulator => {
      prvAccumulator = parseInt(prvAccumulator, 2);
      const decimalDataRegister = parseInt(dataRegister, 2);
      const result = prvAccumulator & decimalDataRegister;
      return makeBinary8Bit(result);
    });
  }

  const F2_READ = () => {
    setDataRegister(prvDataRegister => {
      const decimalAddressRegister = parseInt(addressRegister, 2);
      const decimalDataRegister = parseInt(prvDataRegister, 2);
      const result = memory[decimalAddressRegister];
      return makeBinary8Bit(result);
    });
  }

  const F2_ACTDR = () => {
    setDataRegister(accumulator);
  }

  const F2_INCDR = () => {
    setDataRegister(prvDataRegister => {
      prvDataRegister = parseInt(prvDataRegister, 2);
      const result = prvDataRegister + 1;
      return makeBinary8Bit(result);
    });
  }

  const F2_PCTDR = () => {
    setDataRegister(programCounter.slice (4, 16));
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
      prvAccumulator = parseInt(prvAccumulator, 2);
      const result = ~prvAccumulator;
      return makeBinary8Bit(result);
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
      return makeBinary16Bit(result);
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
      console.log(labelAddresses);
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
        console.log("FYN");
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
        }
      console.log(line);    
    });
    const newCntrlMemory = {...controlMemory};
    updateArray.map((elem) => {
      newCntrlMemory[elem.addr] = {
        content: elem.F1 + "-" + elem.F2 + "-" + elem.F3 + "-" + elem.theCD + "-" + elem.theBR + "-" + elem.nextLineAddr,
        hexContent: makeHex(elem.F1 + elem.F2 + elem.F3 + elem.theCD + elem.theBR + elem.nextLineAddr, 2),
        label: elem.label,
        instruction: "",
      }
    })
    setControlMemory(newCntrlMemory);
  }

  const compileCode = () => {
    const codeText = enteredCode.current.value;
    const codeTextLines = codeText.split('\n');
    const variables = [];
    let addressNumberLables = 0;
    codeTextLines.map((line) => {
      const newLine = line.split(' ');
      if (newLine[0] === 'ORG') {
        addressNumberLables = parseInt(newLine[1]);
      }
      else {
        const newLine2 = line.split(', ');
        const label = newLine2.length > 1 ? newLine[0] : '';
        const myline = newLine2.length > 1 ? newLine[1] : newLine[0];
        if (label !== '') {
          myline = myline.split(' ');
          variables.push({ label: label, address: addressNumberLables });
        }
        addressNumberLables++;
      }
    })
    console.log(variables);
    // console.log(codeTextLines);
    // codeTextLines.map((line) => {
    //   const sepratedLine = line.split(',');
    //   const label = sepratedLine.length > 1 ? newLine[0] : '';
    //   const myline = sepratedLine.length > 1 ? newLine[1] : newLine[0];
    //   const [instruction, address] = myline.split(' ');
    //   const newMemory = {...memory};
    //   newMemory[addressNumberInMemory] = {
    //     address: addressNumberInMemory,
    //     instruction: instruction,
    //     label: label,
    //   }
    //   setMemory(newMemory);
    //   addressNumberInMemory++;
    // }
    // )
  } 

  return (
    <div>
      <div className='textAreas'>
        <div className='input-sides'>
          <h1>Mini Computer Program</h1>
          <textarea className='controlStyle' ref={enteredCode}></textarea>
          <button onClick={compileCode}>Submit</button>
        </div>
        <div className='input-sides'>
          <h1>Control</h1>
          <textarea className='controlStyle' ref={controlCode}></textarea>
          <button onClick={controlTextSubmitted}>Submit Control</button>
        </div>
      </div>
      {output && <p>Output: {output}</p>}
      <p>AC: {accumulator}</p>
      <p>PC: {programCounter}</p>
      <p>AR: {addressRegister}</p>
      <p>DR: {dataRegister}</p>
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
                <td>{controlMemory[key].content}</td>
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
                <td>{memory[key].content}</td>
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
