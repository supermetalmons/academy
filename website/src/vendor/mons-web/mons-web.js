let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
* @param {string} fen_w
* @param {string} fen_b
* @param {string} flat_moves_string_w
* @param {string} flat_moves_string_b
* @returns {string}
*/
export function winner(fen_w, fen_b, flat_moves_string_w, flat_moves_string_b) {
    let deferred5_0;
    let deferred5_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(fen_w, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(fen_b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(flat_moves_string_w, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(flat_moves_string_b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        wasm.winner(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        deferred5_0 = r0;
        deferred5_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
*/
export const Modifier = Object.freeze({ SelectPotion:0,"0":"SelectPotion",SelectBomb:1,"1":"SelectBomb",Cancel:2,"2":"Cancel", });
/**
*/
export const OutputModelKind = Object.freeze({ InvalidInput:0,"0":"InvalidInput",LocationsToStartFrom:1,"1":"LocationsToStartFrom",NextInputOptions:2,"2":"NextInputOptions",Events:3,"3":"Events", });
/**
*/
export const SquareModelKind = Object.freeze({ Regular:0,"0":"Regular",ConsumableBase:1,"1":"ConsumableBase",SupermanaBase:2,"2":"SupermanaBase",ManaBase:3,"3":"ManaBase",ManaPool:4,"4":"ManaPool",MonBase:5,"5":"MonBase", });
/**
*/
export const GameVariant = Object.freeze({ Classic:0,"0":"Classic",SwappedManaRows:1,"1":"SwappedManaRows",OffsetArcManaRows:2,"2":"OffsetArcManaRows",CenterSpokeManaRows:3,"3":"CenterSpokeManaRows",AlternatingManaRows:4,"4":"AlternatingManaRows",InnerWedgeManaRows:5,"5":"InnerWedgeManaRows",OuterWedgeManaRows:6,"6":"OuterWedgeManaRows",BentCenterManaRows:7,"7":"BentCenterManaRows",OuterEdgeManaRows:8,"8":"OuterEdgeManaRows",SplitFlankManaRows:9,"9":"SplitFlankManaRows",ForwardBridgeManaRows:10,"10":"ForwardBridgeManaRows",CornerChainManaRows:11,"11":"CornerChainManaRows", });
/**
*/
export const AvailableMoveKind = Object.freeze({ MonMove:0,"0":"MonMove",ManaMove:1,"1":"ManaMove",Action:2,"2":"Action",Potion:3,"3":"Potion", });
/**
*/
export const Consumable = Object.freeze({ Potion:0,"0":"Potion",Bomb:1,"1":"Bomb",BombOrPotion:2,"2":"BombOrPotion", });
/**
*/
export const EventModelKind = Object.freeze({ MonMove:0,"0":"MonMove",ManaMove:1,"1":"ManaMove",ManaScored:2,"2":"ManaScored",MysticAction:3,"3":"MysticAction",DemonAction:4,"4":"DemonAction",DemonAdditionalStep:5,"5":"DemonAdditionalStep",SpiritTargetMove:6,"6":"SpiritTargetMove",PickupBomb:7,"7":"PickupBomb",PickupPotion:8,"8":"PickupPotion",PickupMana:9,"9":"PickupMana",MonFainted:10,"10":"MonFainted",ManaDropped:11,"11":"ManaDropped",SupermanaBackToBase:12,"12":"SupermanaBackToBase",BombAttack:13,"13":"BombAttack",MonAwake:14,"14":"MonAwake",BombExplosion:15,"15":"BombExplosion",NextTurn:16,"16":"NextTurn",GameOver:17,"17":"GameOver",Takeback:18,"18":"Takeback",UsePotion:19,"19":"UsePotion", });
/**
*/
export const MonKind = Object.freeze({ Demon:0,"0":"Demon",Drainer:1,"1":"Drainer",Angel:2,"2":"Angel",Spirit:3,"3":"Spirit",Mystic:4,"4":"Mystic", });
/**
*/
export const NextInputKind = Object.freeze({ MonMove:0,"0":"MonMove",ManaMove:1,"1":"ManaMove",MysticAction:2,"2":"MysticAction",DemonAction:3,"3":"DemonAction",DemonAdditionalStep:4,"4":"DemonAdditionalStep",SpiritTargetCapture:5,"5":"SpiritTargetCapture",SpiritTargetMove:6,"6":"SpiritTargetMove",SelectConsumable:7,"7":"SelectConsumable",BombAttack:8,"8":"BombAttack", });
/**
*/
export const ManaKind = Object.freeze({ Regular:0,"0":"Regular",Supermana:1,"1":"Supermana", });
/**
*/
export const ItemModelKind = Object.freeze({ Mon:0,"0":"Mon",Mana:1,"1":"Mana",MonWithMana:2,"2":"MonWithMana",MonWithConsumable:3,"3":"MonWithConsumable",Consumable:4,"4":"Consumable", });
/**
*/
export const Color = Object.freeze({ White:0,"0":"White",Black:1,"1":"Black", });

const EventModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_eventmodel_free(ptr >>> 0));
/**
*/
export class EventModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(EventModel.prototype);
        obj.__wbg_ptr = ptr;
        EventModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EventModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_eventmodel_free(ptr);
    }
    /**
    * @returns {EventModelKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_eventmodel_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {EventModelKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_eventmodel_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {ItemModel | undefined}
    */
    get item() {
        const ret = wasm.__wbg_get_eventmodel_item(this.__wbg_ptr);
        return ret === 0 ? undefined : ItemModel.__wrap(ret);
    }
    /**
    * @param {ItemModel | undefined} [arg0]
    */
    set item(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, ItemModel);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_eventmodel_item(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Mon | undefined}
    */
    get mon() {
        const ret = wasm.__wbg_get_eventmodel_mon(this.__wbg_ptr);
        return ret === 0 ? undefined : Mon.__wrap(ret);
    }
    /**
    * @param {Mon | undefined} [arg0]
    */
    set mon(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Mon);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_eventmodel_mon(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ManaModel | undefined}
    */
    get mana() {
        const ret = wasm.__wbg_get_eventmodel_mana(this.__wbg_ptr);
        return ret === 0 ? undefined : ManaModel.__wrap(ret);
    }
    /**
    * @param {ManaModel | undefined} [arg0]
    */
    set mana(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, ManaModel);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_eventmodel_mana(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Location | undefined}
    */
    get loc1() {
        const ret = wasm.__wbg_get_eventmodel_loc1(this.__wbg_ptr);
        return ret === 0 ? undefined : Location.__wrap(ret);
    }
    /**
    * @param {Location | undefined} [arg0]
    */
    set loc1(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Location);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_eventmodel_loc1(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Location | undefined}
    */
    get loc2() {
        const ret = wasm.__wbg_get_eventmodel_loc2(this.__wbg_ptr);
        return ret === 0 ? undefined : Location.__wrap(ret);
    }
    /**
    * @param {Location | undefined} [arg0]
    */
    set loc2(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Location);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_eventmodel_loc2(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Color | undefined}
    */
    get color() {
        const ret = wasm.__wbg_get_eventmodel_color(this.__wbg_ptr);
        return ret === 2 ? undefined : ret;
    }
    /**
    * @param {Color | undefined} [arg0]
    */
    set color(arg0) {
        wasm.__wbg_set_eventmodel_color(this.__wbg_ptr, isLikeNone(arg0) ? 2 : arg0);
    }
}

const ItemModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_itemmodel_free(ptr >>> 0));
/**
*/
export class ItemModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ItemModel.prototype);
        obj.__wbg_ptr = ptr;
        ItemModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ItemModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_itemmodel_free(ptr);
    }
    /**
    * @returns {ItemModelKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_itemmodel_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {ItemModelKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_itemmodel_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Mon | undefined}
    */
    get mon() {
        const ret = wasm.__wbg_get_itemmodel_mon(this.__wbg_ptr);
        return ret === 0 ? undefined : Mon.__wrap(ret);
    }
    /**
    * @param {Mon | undefined} [arg0]
    */
    set mon(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Mon);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_itemmodel_mon(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ManaModel | undefined}
    */
    get mana() {
        const ret = wasm.__wbg_get_itemmodel_mana(this.__wbg_ptr);
        return ret === 0 ? undefined : ManaModel.__wrap(ret);
    }
    /**
    * @param {ManaModel | undefined} [arg0]
    */
    set mana(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, ManaModel);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_itemmodel_mana(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Consumable | undefined}
    */
    get consumable() {
        const ret = wasm.__wbg_get_itemmodel_consumable(this.__wbg_ptr);
        return ret === 3 ? undefined : ret;
    }
    /**
    * @param {Consumable | undefined} [arg0]
    */
    set consumable(arg0) {
        wasm.__wbg_set_itemmodel_consumable(this.__wbg_ptr, isLikeNone(arg0) ? 3 : arg0);
    }
}

const LocationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_location_free(ptr >>> 0));
/**
*/
export class Location {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Location.prototype);
        obj.__wbg_ptr = ptr;
        LocationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Location)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LocationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_location_free(ptr);
    }
    /**
    * @returns {number}
    */
    get i() {
        const ret = wasm.__wbg_get_location_i(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set i(arg0) {
        wasm.__wbg_set_location_i(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get j() {
        const ret = wasm.__wbg_get_location_j(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set j(arg0) {
        wasm.__wbg_set_location_j(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} i
    * @param {number} j
    */
    constructor(i, j) {
        const ret = wasm.location_new(i, j);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}

const ManaModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_manamodel_free(ptr >>> 0));
/**
*/
export class ManaModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ManaModel.prototype);
        obj.__wbg_ptr = ptr;
        ManaModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ManaModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_manamodel_free(ptr);
    }
    /**
    * @returns {ManaKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_manamodel_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {ManaKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_manamodel_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Color}
    */
    get color() {
        const ret = wasm.__wbg_get_manamodel_color(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Color} arg0
    */
    set color(arg0) {
        wasm.__wbg_set_manamodel_color(this.__wbg_ptr, arg0);
    }
}

const MonFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_mon_free(ptr >>> 0));
/**
*/
export class Mon {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Mon.prototype);
        obj.__wbg_ptr = ptr;
        MonFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MonFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mon_free(ptr);
    }
    /**
    * @returns {MonKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_mon_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {MonKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_mon_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Color}
    */
    get color() {
        const ret = wasm.__wbg_get_mon_color(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Color} arg0
    */
    set color(arg0) {
        wasm.__wbg_set_mon_color(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get cooldown() {
        const ret = wasm.__wbg_get_location_i(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set cooldown(arg0) {
        wasm.__wbg_set_location_i(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {boolean}
    */
    is_fainted() {
        const ret = wasm.mon_is_fainted(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    */
    decrease_cooldown() {
        wasm.mon_decrease_cooldown(this.__wbg_ptr);
    }
    /**
    * @param {MonKind} kind
    * @param {Color} color
    * @param {number} cooldown
    * @returns {Mon}
    */
    static new(kind, color, cooldown) {
        const ret = wasm.mon_new(kind, color, cooldown);
        return Mon.__wrap(ret);
    }
    /**
    */
    faint() {
        wasm.mon_faint(this.__wbg_ptr);
    }
}

const MonsGameModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_monsgamemodel_free(ptr >>> 0));
/**
*/
export class MonsGameModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MonsGameModel.prototype);
        obj.__wbg_ptr = ptr;
        MonsGameModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MonsGameModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_monsgamemodel_free(ptr);
    }
    /**
    * @returns {number}
    */
    black_score() {
        const ret = wasm.monsgamemodel_black_score(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Location} location
    */
    remove_item(location) {
        _assertClass(location, Location);
        var ptr0 = location.__destroy_into_raw();
        wasm.monsgamemodel_remove_item(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {number}
    */
    turn_number() {
        const ret = wasm.monsgamemodel_turn_number(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    white_score() {
        const ret = wasm.monsgamemodel_white_score(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {Color}
    */
    active_color() {
        const ret = wasm.monsgamemodel_active_color(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Color} color
    * @returns {boolean}
    */
    can_takeback(color) {
        const ret = wasm.monsgamemodel_can_takeback(this.__wbg_ptr, color);
        return ret !== 0;
    }
    /**
    * @param {string} flat_moves_string_w
    * @param {string} flat_moves_string_b
    * @returns {boolean}
    */
    verify_moves(flat_moves_string_w, flat_moves_string_b) {
        const ptr0 = passStringToWasm0(flat_moves_string_w, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(flat_moves_string_b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_verify_moves(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret !== 0;
    }
    /**
    * @returns {Color | undefined}
    */
    winner_color() {
        const ret = wasm.monsgamemodel_winner_color(this.__wbg_ptr);
        return ret === 2 ? undefined : ret;
    }
    /**
    * @param {string} other_fen
    * @returns {boolean}
    */
    is_later_than(other_fen) {
        const ptr0 = passStringToWasm0(other_fen, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_is_later_than(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
    * @param {(Location)[]} locations
    * @param {Modifier | undefined} [modifier]
    * @returns {OutputModel}
    */
    process_input(locations, modifier) {
        const ptr0 = passArrayJsValueToWasm0(locations, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_process_input(this.__wbg_ptr, ptr0, len0, isLikeNone(modifier) ? 3 : modifier);
        return OutputModel.__wrap(ret);
    }
    /**
    * @returns {(string)[]}
    */
    takeback_fens() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.monsgamemodel_takeback_fens(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    clearTracking() {
        wasm.monsgamemodel_clearTracking(this.__wbg_ptr);
    }
    /**
    * @param {string} preference
    * @returns {OutputModel}
    */
    smartAutomove(preference) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(preference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.monsgamemodel_smartAutomove(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return OutputModel.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {boolean}
    */
    is_moves_verified() {
        const ret = wasm.monsgamemodel_is_moves_verified(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {string} input_fen
    * @returns {OutputModel}
    */
    process_input_fen(input_fen) {
        const ptr0 = passStringToWasm0(input_fen, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_process_input_fen(this.__wbg_ptr, ptr0, len0);
        return OutputModel.__wrap(ret);
    }
    /**
    * @param {(string)[]} takeback_fens
    * @returns {MonsGameModel | undefined}
    */
    without_last_turn(takeback_fens) {
        const ptr0 = passArrayJsValueToWasm0(takeback_fens, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_without_last_turn(this.__wbg_ptr, ptr0, len0);
        return ret === 0 ? undefined : MonsGameModel.__wrap(ret);
    }
    /**
    * @param {GameVariant} variant
    * @returns {MonsGameModel}
    */
    static newForSimulation(variant) {
        const ret = wasm.monsgamemodel_newForSimulation(variant);
        return MonsGameModel.__wrap(ret);
    }
    /**
    * @returns {Int32Array}
    */
    available_move_kinds() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.monsgamemodel_available_move_kinds(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {boolean} enabled
    */
    setVerboseTracking(enabled) {
        wasm.monsgamemodel_setVerboseTracking(this.__wbg_ptr, enabled);
    }
    /**
    * @returns {(Location)[]}
    */
    locations_with_content() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.monsgamemodel_locations_with_content(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} fen
    * @returns {MonsGameModel | undefined}
    */
    static fromFenForSimulation(fen) {
        const ptr0 = passStringToWasm0(fen, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_fromFenForSimulation(ptr0, len0);
        return ret === 0 ? undefined : MonsGameModel.__wrap(ret);
    }
    /**
    * @returns {(VerboseTrackingEntityModel)[]}
    */
    verbose_tracking_entities() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.monsgamemodel_verbose_tracking_entities(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Int32Array}
    */
    inactive_player_items_counters() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.monsgamemodel_inactive_player_items_counters(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayI32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    fen() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.monsgamemodel_fen(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {GameVariant} variant
    * @returns {MonsGameModel}
    */
    static new(variant) {
        const ret = wasm.monsgamemodel_new(variant);
        return MonsGameModel.__wrap(ret);
    }
    /**
    * @param {Location} at
    * @returns {ItemModel | undefined}
    */
    item(at) {
        _assertClass(at, Location);
        var ptr0 = at.__destroy_into_raw();
        const ret = wasm.monsgamemodel_item(this.__wbg_ptr, ptr0);
        return ret === 0 ? undefined : ItemModel.__wrap(ret);
    }
    /**
    * @param {Location} at
    * @returns {SquareModel}
    */
    square(at) {
        _assertClass(at, Location);
        var ptr0 = at.__destroy_into_raw();
        const ret = wasm.monsgamemodel_square(this.__wbg_ptr, ptr0);
        return SquareModel.__wrap(ret);
    }
    /**
    * @returns {OutputModel}
    */
    automove() {
        const ret = wasm.monsgamemodel_automove(this.__wbg_ptr);
        return OutputModel.__wrap(ret);
    }
    /**
    * @param {string} fen
    * @returns {MonsGameModel | undefined}
    */
    static from_fen(fen) {
        const ptr0 = passStringToWasm0(fen, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.monsgamemodel_from_fen(ptr0, len0);
        return ret === 0 ? undefined : MonsGameModel.__wrap(ret);
    }
    /**
    * @returns {OutputModel}
    */
    takeback() {
        const ret = wasm.monsgamemodel_takeback(this.__wbg_ptr);
        return OutputModel.__wrap(ret);
    }
}

const NextInputModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nextinputmodel_free(ptr >>> 0));
/**
*/
export class NextInputModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NextInputModel.prototype);
        obj.__wbg_ptr = ptr;
        NextInputModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NextInputModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nextinputmodel_free(ptr);
    }
    /**
    * @returns {Location | undefined}
    */
    get location() {
        const ret = wasm.__wbg_get_eventmodel_loc1(this.__wbg_ptr);
        return ret === 0 ? undefined : Location.__wrap(ret);
    }
    /**
    * @param {Location | undefined} [arg0]
    */
    set location(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, Location);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_eventmodel_loc1(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Modifier | undefined}
    */
    get modifier() {
        const ret = wasm.__wbg_get_nextinputmodel_modifier(this.__wbg_ptr);
        return ret === 3 ? undefined : ret;
    }
    /**
    * @param {Modifier | undefined} [arg0]
    */
    set modifier(arg0) {
        wasm.__wbg_set_nextinputmodel_modifier(this.__wbg_ptr, isLikeNone(arg0) ? 3 : arg0);
    }
    /**
    * @returns {NextInputKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_nextinputmodel_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {NextInputKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_nextinputmodel_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {ItemModel | undefined}
    */
    get actor_mon_item() {
        const ret = wasm.__wbg_get_nextinputmodel_actor_mon_item(this.__wbg_ptr);
        return ret === 0 ? undefined : ItemModel.__wrap(ret);
    }
    /**
    * @param {ItemModel | undefined} [arg0]
    */
    set actor_mon_item(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, ItemModel);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_nextinputmodel_actor_mon_item(this.__wbg_ptr, ptr0);
    }
}

const OutputModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_outputmodel_free(ptr >>> 0));
/**
*/
export class OutputModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(OutputModel.prototype);
        obj.__wbg_ptr = ptr;
        OutputModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OutputModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_outputmodel_free(ptr);
    }
    /**
    * @returns {(NextInputModel)[]}
    */
    next_inputs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.outputmodel_next_inputs(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {(EventModel)[]}
    */
    events() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.outputmodel_events(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    input_fen() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.outputmodel_input_fen(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {(Location)[]}
    */
    locations() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.outputmodel_locations(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {OutputModelKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_outputmodel_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {OutputModelKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_outputmodel_kind(this.__wbg_ptr, arg0);
    }
}

const SquareModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_squaremodel_free(ptr >>> 0));
/**
*/
export class SquareModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SquareModel.prototype);
        obj.__wbg_ptr = ptr;
        SquareModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SquareModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_squaremodel_free(ptr);
    }
    /**
    * @returns {SquareModelKind}
    */
    get kind() {
        const ret = wasm.__wbg_get_squaremodel_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {SquareModelKind} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_squaremodel_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Color | undefined}
    */
    get color() {
        const ret = wasm.__wbg_get_squaremodel_color(this.__wbg_ptr);
        return ret === 2 ? undefined : ret;
    }
    /**
    * @param {Color | undefined} [arg0]
    */
    set color(arg0) {
        wasm.__wbg_set_squaremodel_color(this.__wbg_ptr, isLikeNone(arg0) ? 2 : arg0);
    }
    /**
    * @returns {MonKind | undefined}
    */
    get mon_kind() {
        const ret = wasm.__wbg_get_squaremodel_mon_kind(this.__wbg_ptr);
        return ret === 5 ? undefined : ret;
    }
    /**
    * @param {MonKind | undefined} [arg0]
    */
    set mon_kind(arg0) {
        wasm.__wbg_set_squaremodel_mon_kind(this.__wbg_ptr, isLikeNone(arg0) ? 5 : arg0);
    }
}

const VerboseTrackingEntityModelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_verbosetrackingentitymodel_free(ptr >>> 0));
/**
*/
export class VerboseTrackingEntityModel {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VerboseTrackingEntityModel.prototype);
        obj.__wbg_ptr = ptr;
        VerboseTrackingEntityModelFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VerboseTrackingEntityModelFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_verbosetrackingentitymodel_free(ptr);
    }
    /**
    * @returns {string}
    */
    events_fen() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.verbosetrackingentitymodel_events_fen(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    fen() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.verbosetrackingentitymodel_fen(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Color}
    */
    color() {
        const ret = wasm.verbosetrackingentitymodel_color(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {(EventModel)[]}
    */
    events() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.verbosetrackingentitymodel_events(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_location_new = function(arg0) {
        const ret = Location.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_eventmodel_new = function(arg0) {
        const ret = EventModel.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_nextinputmodel_new = function(arg0) {
        const ret = NextInputModel.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_location_unwrap = function(arg0) {
        const ret = Location.__unwrap(takeObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_verbosetrackingentitymodel_new = function(arg0) {
        const ret = VerboseTrackingEntityModel.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_1d1f22824a6a080c = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_4a72847cc503995b = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_f686565e586dd935 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_require_cca90b1a94a0255b = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_63b92bc8671ed464 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_buffer_12d079cc21e14bdb = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_e9b4878cebadb3d3 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_a47bac70306a19a7 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_subarray_a1f73cd4b5b42fe1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_c6fb939a7f436783 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_207b558942527489 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_call_27c0f87801dedf93 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('mons-web_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
