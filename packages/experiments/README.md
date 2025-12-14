Getting this error when deploying the contract:
```
2025-12-14 14:08:43.486	
2025-12-14T09:08:42.587Z SwingSet: ls: v1: Logging sent error stack (RemoteError(error:liveSlots:v9#71240)#275)
	2025-12-14 14:08:43.486	
2025-12-14T09:08:42.587Z SwingSet: xsnap: v1: RemoteError(error:liveSlots:v9#71240)#275 ERROR_NOTE: Sent as error:liveSlots:v1#70235
	2025-12-14 14:08:43.486	
2025-12-14T09:08:42.587Z SwingSet: vat: v1: Error: Vat Creation Error: Error: Stack meter exceeded
	2025-12-14 14:08:43.486	
2025-12-14T09:08:42.586Z SwingSet: vat: v1: RemoteError(error:liveSlots:v9#71240)#275: Vat Creation Error: Error: Stack meter exceeded
	2025-12-14 14:08:43.486	
2025-12-14T09:08:42.586Z SwingSet: vat: v1: CORE_EVAL failed: (RemoteError(error:liveSlots:v9#71240)#275)
	2025-12-14 14:08:42.800	
2025-12-14T09:08:42.003Z SwingSet: xsnap: v1: RemoteError(error:liveSlots:v9#71240)#275 ERROR_NOTE: Sent as error:liveSlots:v1#70235
	2025-12-14 14:08:40.485	
2025-12-14T09:08:40.014Z SwingSet: vat: v1: ----- start orchExp.2  5 Starting contract instance
	2025-12-14 14:08:40.485	
2025-12-14T09:08:40.014Z SwingSet: vat: v1: ----- start orchExp.2  4 issuerKeywordRecord { BLD: Object [Alleged: BLD issuer] {}, IST: Object [Alleged: IST issuer] {}, AXL: Object [Alleged: AXL issuer] {} }
	2025-12-14 14:08:40.485	
2025-12-14T09:08:39.997Z SwingSet: vat: v1: ----- start orchExp.2  3 Setting privateArgs
	2025-12-14 14:08:40.485	
2025-12-14T09:08:39.991Z SwingSet: vat: v1: ----- start orchExp.2  2 startContract
	2025-12-14 14:08:40.485	
2025-12-14T09:08:39.991Z SwingSet: vat: v1: coreProposal: startContract
	2025-12-14 14:08:40.485	
2025-12-14T09:08:39.626Z SwingSet: vat: v1: installation orchExp settled; remaining: []
	2025-12-14 14:08:35.485	
2025-12-14T09:08:34.994Z SwingSet: vat: v1: execute { manifestGetterName: 'getManifest', bundleExports: [ 'getManifest', 'startContract' ] }
	2025-12-14 14:08:34.485	
2025-12-14T09:08:34.221Z SwingSet: vat: v1: evaluateBundleCap { manifestBundleRef: { bundleID: 'b1-9acc2b63fc4e3bbbf9d9cb27bd100b1f3d923bc2b9e7107d9bbd43f3a3eea2eee8e093e77a2096857d8672d5bc1afc8ea5def56a0b07cd4b857d4bc64ab4938b' }, manifestGetterName: 'getManifest', vatAdminSvc: Promise [Promise] {} }
	2025-12-14 14:08:34.485	
2025-12-14T09:08:34.217Z SwingSet: vat: v1: installation orchExp: new Promise
```