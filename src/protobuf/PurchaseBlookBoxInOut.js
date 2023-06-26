import { Message, ScalarType, proto3 } from "@bufbuild/protobuf";

export default class PurchaseBlookBoxOut extends Message {
    unlockedBlook = "";
    unlockedBlook = false;
    tokens = 0;
    constructor(data) {
        super();
        proto3.util.initPartial(data, this);
    }
    static runtime = proto3;
    static typeName = "PurchaseBlookBoxOut";
    static fields = proto3.util.newFieldList(() => [
        { no: 1, name: "unlocked_blook", kind: "scalar", T: ScalarType.STRING },
        { no: 2, name: "is_new_to_user", kind: "scalar", T: ScalarType.BOOL },
        { no: 3, name: "tokens", kind: "scalar", T: ScalarType.INT32 }
    ]);

    static fromBinary(bytes, options) {
        return new PurchaseBlookBoxOut().fromBinary(bytes, options);
    }

    static fromJson(jsonValue, options) {
        return new PurchaseBlookBoxOut().fromJson(jsonValue, options);
    }

    static fromJsonString(jsonString, options) {
        return new PurchaseBlookBoxOut().fromJsonString(jsonString, options);
    }

    static equals(a, b) {
        return proto3.util.equals(PurchaseBlookBoxOut, a, b);
    }
}