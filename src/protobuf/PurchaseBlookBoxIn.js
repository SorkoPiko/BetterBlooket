import { Message, ScalarType, proto3 } from "@bufbuild/protobuf";

export default class PurchaseBlookBoxIn extends Message {
    boxName = "";
    constructor(data) {
        super();
        proto3.util.initPartial(data, this);
    }
    static runtime = proto3;
    static typeName = "PurchaseBlookBoxIn";
    static fields = proto3.util.newFieldList(() => [
        { no: 1, name: "box_name", kind: "scalar", T: ScalarType.STRING }
    ]);

    static fromBinary(bytes, options) {
        return new PurchaseBlookBoxIn().fromBinary(bytes, options);
    }

    static fromJson(jsonValue, options) {
        return new PurchaseBlookBoxIn().fromJson(jsonValue, options);
    }

    static fromJsonString(jsonString, options) {
        return new PurchaseBlookBoxIn().fromJsonString(jsonString, options);
    }

    static equals(a, b) {
        return proto3.util.equals(PurchaseBlookBoxIn, a, b);
    }
}