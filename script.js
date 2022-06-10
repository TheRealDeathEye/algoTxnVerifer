class TxnVerifer{
  constructor(){
    this.errorCheck = 
    {   
      valid:true,
      error:[],
      warnings:[]
    };
    this.max64 = (2**64)-1;
    this.idTable= {"mainnet-v1.0":"wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
        "testnet-v1.0":	"SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
        "betanet-v1.0":	"mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0="};
  }
  verifyAsset(AssetObj){
    
  }
  verifyTxn(txn){
    const Required = ["type", "snd", "fee", "fv", "lv", "gh"];
    const Optional = ["gen", "grp", "lx", "note", "rekey"];
    const AssetParamsOpt = ["un", "an", "au", "am", "m", "r", "f", "c"];
    const AppCallOpt = ["apat", "apap", "apaa", "apsu", "apfa", "apas", "apgs", "apls", "apep"];
    for(requirement of Required){
      if(!txn[requirement]){
        this.throw(4300, 'Required field missing: '+requirement);
      } else {
        if(requirement === "fee"){
          const fee = requirement
          if(!Number.isInteger(txn[requirement]) || txn[requirement]<1000 || txn[requirement]>this.max64){
            this.throw(4300,'fee must be a uint64 between 1000 and 18446744073709551615');
          }
          else{
            if(txn[fee] > 1000000){
              this.errorCheck.warnings.push('fee is very high: '+txn[fee]+' microalgos');
            }
          }
        }
        if(requirement === "fv"){
          if(!Number.isInteger(txn[requirement]) || txn[requirement]<1 || txn[requirement]>this.max64){
            this.throw(4300, 'fv must be a uint64 between 1 and 18446744073709551615')
          }
        }
        if(requirement === "gh"){
          if(txn[requirement] instanceof Uint32Array){
            this.throw(4300, 'gh must be Uint32Array');
          }
          if(!Object.values(idTable).includes(txn[requirement])){
            this.throw(4300, 'gh must be valid network hash');
          }
        }
        if(requirement === "lv"){
          if(!Number.isInteger(txn[requirement]) || txn[requirement]<1 || txn[requirement]>this.max64){
            this.throw(4300, 'lv must be uint64 between 1 and 18446744073709551615');
          }
          if(txn[requirement]<txn["fv"]){
            this.throw(4300, 'lv must be greater or equal to fv');
          }
        }
        if(requirement === "snd"){
          if(!algosdk.isValidAddress(txn[requirement])){
            this.throw(4300, 'snd must be a valid sender address');
          }
        }
        if(requirement === "type"){
          if(typeof txn[requirement] !== "string"){
            this.throw(4300, 'type must be a string');
          }
        }
      }
    }
    if(this.errorCheck.valid===true){
      for(option of Optional){
        if(txn.hasOwnProperty(option)){
          if(option === "gen"){
            if(typeof txn[option] !== "string"){
              this.throw(4300, 'gen must be a string');
            }
            if(this.idTable[txn[option]] !== txn["gh"]){
              this.throw(4300, 'gen must match the same network as gh');
            }
          }
          if(option === "grp"){
            if(!txn[option] instanceof Uint32Array){
              this.throw(4300, 'grp must be a Uint32Array');
            }
          }
          if(option === "lx"){
            if(!txn[option] instanceof Uint32Array){
              this.throw(4300, 'lx must be a Uint32Array');
            }
          }
          if(option === "note"){
            if(txn[option].byteLength>1000){
              this.throw(4300, 'note must be a UintArray with the amount of bytes less than or equal to 1000');
            }
          }
          if(option === "rekey"){
            if(!algosdk.isValidAddress(txn[option])){
              this.throw(4300, 'rekey must be a valid authorized address');
            } else {
              this.errorCheck.warnings.push('this transaction involves rekeying');
            }
          }
        }
      }
    }
    if(this.errorCheck.valid===true){
      if(txn.type === "pay"){
        if(txn.rcv && txn.amt){
          if(!algosdk.isValidAddress(txn.rcv)){
            this.throw(4300, 'rcv must be a valid receiver address');
          }
          if(!Number.isInteger(txn.amt) || txn.amt<1 || txn.amt>this.max64){
            this.throw(4300, 'amt must be a uint64 between 1 and 18446744073709551615');
          }
        } else {
          this.throw(4300, 'rcv and amt fields are required in Payment Transaction');
        }
        if(txn.close && !algosdk.isValidAddress(txn.close)){
          this.throw(4300, 'close must be a valid CloseRemainderTo address');
        }
      }
      else if(txn.type === "keyreg"){
        this.throw(4200, 'this wallet does not support a Key Registration Txn');
      }
      else if(txn.type === "acfg"){
        if(txn.caid && txn.apar){
          if(!Number.isInteger(txn.caid) || txn.caid<0 || txn.caid>this.max64){
            this.throw(4300, 'caid must be a uint64 between 0 and 18446744073709551615');
          }
          if(txn.caid === 0){
            if(!Number.isInteger(txn.apar.t) || txn.apar.t<1 || txn.apar.t>this.max64){
              this.throw(4300, 'apar.t must be a uint64 between 1 and 18446744073709551615');
            }
            if(!Number.isInteger(txn.apar.dc) || txn.apar.dc<0 || txn.apar.dc>19){
              this.throw(4300, 'apar.dc must be a uint32 between 0 and 19');
            }
            if(typeof txn.apar.df !== 'boolean'){
              this.throw(4300, 'apar.df must be a boolean')
            }
          }
          if(txn.apar){
            for (opt of AssetParamsOpt){
              if(txn.apar.hasOwnProperty(opt)){
                if(opt === "un"){
                  if(typeof txn.apar[opt] !== "string" || this.stringBytes(txn.apar[opt])>8){
                    this.throw(4300, 'apar.un must be a string that is 8 bytes or less');
                  }
                }
                if(opt === "an"){
                  if(typeof txn.apar[opt] !== "string" || this.stringBytes(txn.apar[opt])>32){
                    this.throw(4300, 'apar.an must be a string that is 32 bytes or less');
                  }
                }
                if(opt === "au"){
                  if(typeof txn.apar[opt] !== "string" || this.stringBytes(txn.apar[opt])>96){
                    this.throw(4300, 'apar.au must be a string that is 96 bytes or less');
                  }
                }
                if(opt === "am"){
                  if(txn.apar[opt].byteLength === undefined){
                    this.throw(4300, 'apar.am must be a UintArray, preferrably 32-byte');
                  }
                }
                if(opt === "m" || opt === "r" || opt === "f" || opt === "c"){
                  if(!algosdk.isValidAddress(txn.apar[opt])){
                    this.throw(4300, 'apar.'+opt+' must be a valid address');
                  }
                }
              }
            }
          }
        } else {
          this.throw(4300, 'caid and apar fields are required in Asset Config Txn; 0 for caid on asset creation; apar is omitted on asset destroy');
        }
      }
      else if(txn.type === "axfer"){
        //asset clawback
        if(txn.snd && txn.xaid && txn.aamt && txn.asnd && txn.arcv){
          if(!algosdk.isValidAddress(txn.snd)){
            this.throw(4300, 'snd must be a valid Sender address');
          }
          if(!Number.isInteger(txn.xaid) || txn.xaid<0 || txn.xaid>this.max64){
            this.throw(4300, 'xaid must be a uint64 between 0 and 18446744073709551615');
          }
          if(!Number.isInteger(txn.aamt) || txn.aamt<0 || txn.aamt>this.max64){
            this.throw(4300, 'aamt must be a uint64 between 0 and 18446744073709551615');
          }
          if(!algosdk.isValidAddress(txn.asnd)){
            this.throw(4300, 'asnd must be a valid AssetSender address');
          }
          if(!algosdk.isValidAddress(txn.arcv)){
            this.throw(4300, 'arcv must be a valid AssetReceiver address');
          }
        }
        //asset xfer
        else if(txn.xaid && txn.aamt && txn.asnd && txn.arcv){
          if(!Number.isInteger(txn.xaid) || txn.xaid<0 || txn.xaid>this.max64){
            this.throw(4300, 'xaid must be a uint64 between 0 and 18446744073709551615');
          }
          if(!Number.isInteger(txn.aamt) || txn.aamt<0 || txn.aamt>this.max64){
            this.throw(4300, 'aamt must be a uint64 between 0 and 18446744073709551615');
          }
          if(!algosdk.isValidAddress(txn.asnd)){
            this.throw(4300, 'asnd must be a valid AssetSender address');
          }
          if(!algosdk.isValidAddress(txn.arcv)){
            this.throw(4300, 'arcv must be a valid AssetReceiver address');
          }
          if(txn.aclose && !algosdk.isValidAddress(txn.aclose)){
            this.throw(4300, 'aclose must be a valid AssestCloseTo address');
          }
        }
        //asset accept
        else if(txn.xaid && txn.snd && txn.arcv){
          if(!Number.isInteger(txn.xaid) || txn.xaid<0 || txn.xaid>this.max64){
            this.throw(4300, 'xaid must be a uint64 between 0 and 18446744073709551615');
          }
          if(!algosdk.isValidAddress(txn.snd)){
            this.throw(4300, 'snd must be a valid Sender address');
          }
          if(!algosdk.isValidAddress(txn.arcv)){
            this.throw(4300, 'arcv must be a valid AssetReceiver address');
          }
        }
        else{
          this.throw(4300, 'all required fields need to filled according to if a Asset Transfer, Asset Accept, or Asset Clawback Txn was chosen')
        }
      }
      else if(txn.type === "afrz"){
        if(txn.fadd && txn.faid && txn.afrz){
          if(!algosdk.isValidAddress(txn.fadd)){
            this.throw(4300, 'fadd must be a valid FreezeAccount address');
          }
          if(!Number.isInteger(txn.faid) || txn.faid<0 || txn.faid>this.max64){
            this.throw(4300, 'faid must be a uint64 between 0 and 18446744073709551615');
          }
          if(typeof txn.afrz !== 'boolean'){
            this.throw(4300, 'afrz must be a boolean')
          }
        } else {
          this.throw(4300, 'fadd, faid, and afrz fields are required in Asset Freeze Txn');
        }
      }
      else if(txn.type === "appl"){
        if(txn.apid && txn.apan){
          if(!Number.isInteger(txn.apid) || txn.apid<0 || txn.apid>this.max64){
            this.throw(4300, 'apid must be a uint64 between 0 and 18446744073709551615; apid should be empty if creating');
          }
          if(!Number.isInteger(txn.apan) || txn.apan<0 || txn.apan>5){
            this.throw(4300, 'apan must be a uint64 between 0 and 5');
          }
          for (opt of AppCallOpt){
            if(txn.hasOwnProperty(opt)){
              if(opt === "apat" && !this.arrayCheck(txn[opt])){
                this.throw(4300, 'apat must be an array of valid addresses');
              }
              if(opt === "apap" && txn[opt].byteLength === undefined){
                this.throw(4300, 'apap must be a []byte')
              }
              if(opt === "apaa" && txn[opt].byteLength === undefined){
                this.throw(4300, 'apaa must be a []byte')
              }
              if(opt === "apsu" && txn[opt].byteLength === undefined){
                this.throw(4300, 'apsu must be a []byte')
              }
              if(opt === "apfa" && !this.arrayCheck(txn[opt])){
                this.throw(4300, 'apfa must be an array of valid addresses');
              }
              if(opt === "apas" && !this.arrayCheck(txn[opt])){
                this.throw(4300, 'apas must be an array of valid addresses');
              }
              if(opt === "apgs"){
                this.stateSchemaCheck(txn[opt], opt);
              }
              if(opt === "apls"){
                this.stateSchemaCheck(txn[opt], opt);
              }
              if(opt === "apep" && txn[opt].byteLength){
                if(txn[opt].byteLength>2048){
                  this.throw(4300, 'apep must be a Uint8Array with less than or equal to 2048 bytes');
                }
              }
            }
          }
        } else {
          this.throw(4300, 'apid and apan fields are required in Application Call Txn');
        }
      }
      else{
        throw(4300, 'must specify the type of transaction');
      }
    }
  }
  stringBytes(str){
    return Buffer.from(str).length;
  }
  arrayAddressCheck(array){
    if(Object.prototype.toString.call(array) === '[object Array]') {
      for(address of array){
        if(!algosdk.isValidAddress(address)){
          return false;
        }
      }
      return true;
    }
    return false;
  }
  stateSchemaCheck(stateObj,codecName){
    if(typeof stateObj === "object"){
      if(stateObj.nui && stateObj.nbs){
        if(!Number.isInteger(stateObj.nui) || stateObj.nui<0 || stateObj.nui>this.max64){
          this.throw(4300, codecName+'.nui must be a uint64 between 0 and 18446744073709551615');
        }
        if(!Number.isInteger(stateObj.nbs) || stateObj.nbs<0 || stateObj.nbs>this.max64){
          this.throw(4300, codecName+'.nbs must be a uint64 between 0 and 18446744073709551615');
        }
      } else{
        this.throw(4300, codecName+' must be an object with {nui:uint64, nbs:uint64}');
      }
    } else{
      this.throw(4300, codecName+' must be an object with {nui:uint64, nbs:uint64}');
    }
  }
  throw(code, message){
    this.errorCheck.valid=false;
    this.errorCheck.error.push({code:code,message:message});
  }
}
