import { Message, ScalarType, proto3 } from "@bufbuild/protobuf";

export const blook = proto3.makeMessageType("dashboardservice.v1.ProfileBlook", function () {
    return [
        { no: 1, name: "name", kind: "scalar", T: ScalarType.STRING },
        { no: 2, name: "svg_url", kind: "scalar", T: ScalarType.STRING },
        { no: 3, name: "num_owned", kind: "scalar", T: ScalarType.INT32 },
        { no: 4, name: "set", kind: "scalar", T: ScalarType.STRING },
        { no: 5, name: "rarity", kind: "scalar", T: ScalarType.STRING },
        { no: 6, name: "team_name", kind: "scalar", T: ScalarType.STRING },
        { no: 7, name: "color", kind: "scalar", T: ScalarType.STRING }
    ]
})

export default class ListUnlockedBlooks extends Message {
    blooks = [];
    constructor(data) {
        super();
        proto3.util.initPartial(data, this);
    }
    static runtime = proto3;
    static typeName = "ListUnlockedBlooks";
    static fields = proto3.util.newFieldList(() => [
        { no: 1, name: "blooks", kind: "scalar", T: ScalarType.STRING, repeated: true }
    ]);

    static fromBinary(bytes, options) {
        return new ListUnlockedBlooks().fromBinary(bytes, options);
    }

    static fromJson(jsonValue, options) {
        return new ListUnlockedBlooks().fromJson(jsonValue, options);
    }

    static fromJsonString(jsonString, options) {
        return new ListUnlockedBlooks().fromJsonString(jsonString, options);
    }

    static equals(a, b) {
        return proto3.util.equals(ListUnlockedBlooks, a, b);
    }
}