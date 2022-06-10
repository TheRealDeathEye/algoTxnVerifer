
// {valid: true:|false
//     error?: {
//       code: 4001 / 4300 / 4200 //https://arc.algorand.foundation/ARCs/arc-0001
//       message: "message"
//     }
//   }

class TxnVerifer{
  constructor(){
    this.errorCheck = {valid:true};
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
    for(requirement of Required){
      if(!txn[requirement]){
        throw(4300, 'Required field missing: '+requirement);
      } else {
        if(requirement === "fee"){
          if(!Number.isInteger(txn[requirement]) || txn[requirement]<1000 || txn[requirement]>this.max64){
            throw(4300,'fee must be a uint64 between 1000 and 18446744073709551615');
          }
        }
        if(requirement === "fv"){
          if(!Number.isInteger(txn[requirement]) || txn[requirement]<1 || txn[requirement]>this.max64){
            throw(4300, 'fv must be a unit64 between 1 and 18446744073709551615')
          }
        }
        if(requirement === "gh"){
          if(txn[requirement] instanceof Uint32Array){
            throw(4300, 'gh must be Uint32Array');
          }
          if(!Object.values(idTable).includes(txn[requirement])){
            throw(4300, 'gh must be valid network hash');
          }
        }
        if(requirement === "lv"){
          if(!Number.isInteger(txn[requirement]) || txn[requirement]<1 || txn[requirement]>this.max64){
            throw(4300, 'lv must be unit64 between 1 and 18446744073709551615');
          }
          if(txn[requirement]<txn["fv"]){
            throw(4300, 'lv must be greater or equal to fv');
          }
        }
        if(requirement === "snd"){
          if(!algosdk.isValidAddress(txn[requirement])){
            throw(4300, 'snd must be a valid sender address');
          }
        }
        if(requirement === "type"){
          if(typeof txn[requirement] !== "string"){
            throw(4300, 'type must be a string');
          }
        }
      }
    }
    if(this.errorCheck.valid===true){
      for(option of Optional){
        if(txn.hasOwnProperty(option)){
          if(option === "gen"){
            if(typeof txn[option] !== "string"){
              throw(4300, 'gen must be a string');
            }
            if(this.idTable[txn[option]] !== txn["gh"]){
              throw(4300, 'gen must match the same network as gh');
            }
          }
          if(option === "grp"){
            if(!txn[option] instanceof Uint32Array){
              throw(4300, 'grp must be a Uint32Array');
            }
          }
          if(option === "lx"){
            if(!txn[option] instanceof Uint32Array){
              throw(4300, 'lx must be a Uint32Array');
            }
          }
          if(option === "note"){
            if(txn[option].byteLength>1000){
              throw(4300, 'note must be a UintArray with the amount of bytes less than or equal to 1000');
            }
          }
          if(option === "rekey"){
            if(!algosdk.isValidAddress(txn[option])){
              throw(4300, 'rekey must be a valid authorized address');
            }
          }
        }
      }
    }
    if(this.errorCheck.valid===true){
      if(txn.type === "pay"){
        if(txn.rcv && txn.amt){
          if(!algosdk.isValidAddress(txn.rcv)){
            throw(4300, 'rcv must be a valid receiver address');
          }
          if(!Number.isInteger(txn.amt) || txn.amt<1 || txn.amt>this.max64){
            throw(4300, 'amt must be a uint64 between 1 and 18446744073709551615');
          }
        } else {
          throw(4300, 'rcv and amt fields are required in Payment Transaction');
        }
        if(txn.close && !algosdk.isValidAddress(txn.close)){
          throw(4300, 'close must be a valid CloseRemainderTo address');
        }
      }
      else if(txn.type === "keyreg"){
        throw(4200, 'this wallet does not support a Key Registration Txn');
      }
      else if(txn.type === "acfg"){
        if(txn.caid && txn.apar){
          if(!Number.isInteger(txn.caid) || txn.caid<0 || txn.caid>this.max64){
            throw(4300, 'caid must be a uint64 between 0 and 18446744073709551615');
          }
          if(txn.caid === 0){
            if(!Number.isInteger(txn.apar.t) || txn.apar.t<1 || txn.apar.t>this.max64){
              throw(4300, 'apar.t must be a uint64 between 1 and 18446744073709551615');
            }
            if(!Number.isInteger(txn.apar.dc) || txn.apar.dc<0 || txn.apar.dc>19){
              throw(4300, 'apar.dc must be a uint32 between 0 and 19');
            }
            if(typeof txn.apar.df !== 'boolean'){
              throw(4300, 'apar.df must be a boolean')
            }
          }
          for (opt of AssetParamsOpt){
            if(txn.apar.hasOwnProperty(opt)){
              if(opt === "un"){
                
              }
              if(opt === "an"){
                
              }
              if(opt === "au"){
                
              }
              if(opt === "am"){
                
              }
              if(opt === "m"){
                
              }
              if(opt === "r"){
                
              }
              if(opt === "f"){
                
              }
              if(opt === "c"){
                
              }
            }
          }
        } else {
          throw(4300, 'caid and apar fields are required in Asset Config Txn; 0 for caid on asset creation; apar is omitted on asset destroy');
        }
      }
      else if(txn.type === "axfer"){}
      else if(txn.type === "afrz"){}
      else if(txn.type === "appl"){}
      else{
        throw(4300, 'must specify the type of transaction');
      }
    }
  }
}
