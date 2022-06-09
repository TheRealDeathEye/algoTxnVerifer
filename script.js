
/*returns 

{
  valid: true:|false
  error?: {
    code: 4001 / 4300 / 4200 //https://arc.algorand.foundation/ARCs/arc-0001
    message: "message"
  }
}
*/
class TxnVerifer{
    constructor(){
    }
    verifyAsset(AssetObj){
      
    }
    verifyTxn(txn){
        const Required = ["type", "snd", "fee", "fv", "lv", "gh"];
        const Optional = ["gen", "grp", "lx", "note", "rekey"];
        const Types = ["pay", "keyreg", "acfg", "axfer", "afrz", "appl"];
        const idTable = {
          "mainnet-v1.0":"wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "testnet-v1.0":	"SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
          "betanet-v1.0":	"mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0="
        };
        const validGH = [];
        const validGEN = []; 
        for(requirement of Required){
          if(!txn[requirement]){
            //throw();
          }
          if(requirement === "fee"){
            if(Number.isInteger(requirement) && requirement>=1000 && requirement<=2**64){
              //set fee
            }
          }
          if(requirement === "fv"){
            if(Number.isInteger(requirement) && requirement>=1 && requirement<=2**64){
              //set fv
            }
          }
          if(requirement === "gh"){
            if(requirement instanceof Uint32Array){
              if(Object.values(idTable).includes(requirement)){
                //set gh
              }
            }
          }
          if(requirement === "lv"){
            if(Number.isInteger(requirement) && requirement>=1 && requirement<=2**64 && requirement>=txn["fv"]){
              //set lv
            }
          }
          if(requirement === "snd"){
            if(algosdk.isValidAddress(requirement)){
              //set snd
            }
          }
          if(requirement === "type"){
            if(typeof requirement === "string"){
              if()
              //set snd
            }
          }
        }
        for(option of Optional){
          if(txn.hasOwnProperty(option)){
            if(option === "gen"){
              if(typeof option === "string"){
                if(Object.keys(idTable).includes(option)){
                  //add gen
                }
              }
            }
            if(option === "grp"){
              if(option instanceof Uint32Array){
                //check if apart of group
              }
            }
            if(option === "lx"){
              if(option instanceof Uint32Array){
                //check if lease is valid
              }
            }
            if(option === "note"){
              if(option.byteLength<=1000){
                //add note
              }
            }
            if(option === "rekey"){
              if(algosdk.isValidAddress(option)){
                //use this address to rekey; auth futures txns
              }
            }
          }
        }
        
        if(txn.type === "pay"){
    
        }
        else if(txn.type === "keyreg"){
    
        }
        else if(txn.type === "acfg"){
    
        }
        else if(txn.type === "axfer"){}
        else if(txn.type === "afrz"){}
        else if(txn.type === "appl"){}
        else{
            //throw();
        }
    
    }
}
