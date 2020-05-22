import _isNumber from 'lodash/isNumber';
import BaseModel from '../base/BaseModel';
import { INVALID_NUMBER } from '../constants/globalConstants';
import { convertToThousands } from '../utilities/unitConverters';
import { buildPolyPositionModels, point_in_area } from '../math/vector';

/**
 * An enclosed region defined by a series of Position objects and an altitude range
 *
 * @class AirspaceModel
 */
export default class AirspaceModel extends BaseModel {
    /**
     * @for AirspaceModel
     * @constructor
     * @param airspace {object}
     * @param airportPosition {StaticPositionModel}
     * @param magneticNorth {number}
     */
    constructor(airspace, airportPosition, magneticNorth) {
        super();

        if (!airspace || !airportPosition || !_isNumber(magneticNorth)) {
            // eslint-disable-next-line max-len
            throw new TypeError('Invalid parameter, expected airspace, airportPosition and magneticNorth to be defined');
        }

        /**
         * List of lat/long coordinates that outline the shape of the area
         *
         * DO NOT repeat the origin to 'close' the shape, this happens programatically
         *
         * @for AirspaceModel
         * @property poly
         * @type {array}
         * @default []
         */
        this.poly = [];

        /**
         * Altitude at bottom of area, in hundreds of feet
         *
         * @for AirspaceModel
         * @property floor
         * @type {number}
         * @default INVALID_NUMBER
         */
        this.floor = INVALID_NUMBER;

        /**
         * Altitude of top of area, in hundreds of feet
         *
         * @for AirspaceModel
         * @property ceiling
         * @type {number}
         * @default INVALID_NUMBER
         */
        this.ceiling = INVALID_NUMBER;

        /**
         * FAA airspace classification (A,B,C,D,E,G)
         *
         * @for AirspaceModel
         * @property airspace_class
         * @type {string}
         * @default ''
         */
        this.airspace_class = '';

        return this._init(airspace, airportPosition, magneticNorth);
    }

    /**
     * Initialize the model
     *
     * @for AirspaceModel
     * @method _init
     * @param airspace {array}
     * @param airportPosition {StaticPositionModel}
     * @param magneticNorth {number}
     * @private
     */
    _init(airspace, airportPosition, magneticNorth) {
        this.floor = convertToThousands(airspace.floor);
        this.ceiling = convertToThousands(airspace.ceiling);
        this.airspace_class = airspace.airspace_class;
        this.poly = buildPolyPositionModels(airspace.poly, airportPosition, magneticNorth);

        return this;
    }

    /**
     * @for AirspaceModel
     * @method reset
     */
    reset() {
        this.poly = [];
        this.floor = INVALID_NUMBER;
        this.ceiling = INVALID_NUMBER;
        this.airspace_class = '';
    }

    /**
     *
     *
     * @for AirspaceModel
     * @method isPointInside
     * @param point {array} x,y
     * @return {boolean}
     */
    isPointInside(point) {
        if (!point_in_area(point, this.poly)) {
            return false;
        }

        return true;
    }
}
