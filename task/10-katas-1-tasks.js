'use strict';

/**
 * Возвращает массив из 32 делений катушки компаса с названиями.
 * Смотрите детали здесь:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Пример возвращаемого значения :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    let sides = ['N','E','S','W'];  // use array of cardinal directions only!
    let points = []

    let curr_azimuth = 0;
    let getCompassPoint = (abbreviation, azimuth) => {
        const point = {
            abbreviation: abbreviation,
            azimuth: azimuth
        };
        curr_azimuth += 11.25;

    return point;
    }
    for (let i = 0; i < sides.length; i++) {
        const side = sides[i];
        const next = (i == sides.length - 1) ? sides[0] : sides[i + 1];
        const isEven = !(i % 2);

        points.push(getCompassPoint(`${side}`, curr_azimuth));
        points.push(getCompassPoint(`${side}b${next}`, curr_azimuth));
        points.push(getCompassPoint(isEven ? `${side}${side}${next}` : `${side}${next}${side}`, curr_azimuth));
        points.push(getCompassPoint(isEven ? `${side}${next}b${side}` : `${next}${side}b${side}`, curr_azimuth));
        points.push(getCompassPoint(isEven ? `${side}${next}` : `${next}${side}`, curr_azimuth));
        points.push(getCompassPoint(isEven ? `${side}${next}b${next}` : `${next}${side}b${next}`, curr_azimuth));
        points.push(getCompassPoint(isEven ? `${next}${side}${next}` : `${next}${next}${side}`, curr_azimuth));
        points.push(getCompassPoint(`${next}b${side}`, curr_azimuth));
    }

    return points;
}


/**
 * Раскройте фигурные скобки указанной строки.
 * Смотрите https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * Во входной строке пары фигурных скобок, содержащие разделенные запятыми подстроки,
 * представляют наборы подстрок, которые могут появиться в этой позиции на выходе.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * К СВЕДЕНИЮ: Порядок выходных строк не имеет значения.
 *
 * Пример:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    const OPEN = '{';
    const CLOSE = '}';
    const SEPARATOR = ',';
    const BLANK = ' ';

    let i = 0;
    let curLevel = getVariants(0, "{"+str+"}");

    for (let word of curLevel) {
        yield word;
    } 

   function addToArray(resArr, addStr) {
        if (!resArr.length) return [addStr];
        return resArr.map( x => x.concat(addStr))
    }

    function pushToArray(resArr, addArr) {
        if (!resArr.length) return addArr;
        addArr.map( x => resArr.push(x));
        return resArr;
    }

    function concatVariants(variants, array) {
        if (!array.length) return variants;
        let result = [];
        for (let variant of variants) {
            for (let substr of array) {
                result.push(substr.concat(variant));
            }
        }
    return result;
}

function getVariants(startIndex, str) {
    let curLevel = [];
    let variants = [];
    i = startIndex;
    while (str[i]) {
        if (str[i] == OPEN) {
            if (startIndex != i) {
                variants = addToArray(variants, str.substring(startIndex, i));
            }
            variants = concatVariants(getVariants(i + 1, str), variants);
            startIndex = i + 1;
        }
        else if (str[i] == CLOSE) {
            if (startIndex != i || !variants.length) {
                variants = concatVariants([str.substring(startIndex, i)], variants);
            } 

            curLevel = pushToArray(curLevel, variants);
            return curLevel;
        }
        else if (str[i] == SEPARATOR && str[i + 1] != BLANK) {
            if (startIndex != i) {
                variants = concatVariants([str.substring(startIndex, i)], variants);
            }
            curLevel = pushToArray(curLevel, variants);
            variants = [];
            startIndex = i + 1;
        }
        i++;
    }
    if (!curLevel.length) return variants;
    return curLevel;
}
}


/**
 * Возвращает ZigZag матрицу
 *
 * Основная идея в алгоритме сжатия JPEG -- отсортировать коэффициенты заданного изображения зигзагом и закодировать их.
 * В этом задании вам нужно реализовать простой метод для создания квадратной ZigZag матрицы.
 * Детали смотрите здесь: https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * https://ru.wikipedia.org/wiki/JPEG
 * Отсортированные зигзагом элементы расположаться так: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - размер матрицы
 * @return {array}  массив размером n x n с зигзагообразным путем
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    let matrix = [];
    for (let i = 0; i < n; i++) 
        matrix[i] = [];

    let i = 0, j = 0;
    const total = n * n;

    for (let num = 0; num < total; num++) {
        matrix[i][j] = num;
        if ((i + j) % 2 == 0) {
            (j + 1 < n) ? j ++ : i += 2;
            if (i > 0) i --;
        } else {
            (i + 1 < n) ? i ++ : j += 2;
            if (j > 0) j --;
        }
    }
    return matrix;
}


/**
 * Возвращает true если заданный набор костяшек домино может быть расположен в ряд по правилам игры.
 * Детали игры домино смотрите тут: https://en.wikipedia.org/wiki/Dominoes
 * https://ru.wikipedia.org/wiki/%D0%94%D0%BE%D0%BC%D0%B8%D0%BD%D0%BE
 * Каждая костяшка представлена как массив [x,y] из значений на ней.
 * Например, набор [1, 1], [2, 2], [1, 2] может быть расположен в ряд ([1, 1] -> [1, 2] -> [2, 2]),
 * тогда как набор [1, 1], [0, 3], [1, 4] не может.
 * К СВЕДЕНИЮ: в домино любая пара [i, j] может быть перевернута и представлена как [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    const result = Array(1);
    result[0] = dominoes.shift();

    let lastLength = 0;
    while (lastLength != dominoes.length && dominoes.length > 0) {
        lastLength = dominoes.length;
        for (let i = 0; i < dominoes.length; i++) {
            if (result[result.length - 1][1] == dominoes[i][0] && result[result.length - 1][0] != dominoes[i][1]) {
                result[result.length] = dominoes[i];
                dominoes.splice(i, 1);
            } else if (result[result.length - 1][1] == dominoes[i][1] && result[result.length - 1][0] != dominoes[i][1]) {
                result[result.length] = dominoes[i].reverse();
                dominoes.splice(i, 1);
            }
        }
    };

    return dominoes.length == 0;
}


/**
 * Возвращает строковое представление заданного упорядоченного списка целых чисел.
 *
 * Строковое представление списка целых чисел будет состоять из элементов, разделенных запятыми. Элементами могут быть:
 *   - отдельное целое число
 *   - или диапазон целых чисел, заданный начальным числом, отделенным от конечного числа черточкой('-').
 *     (Диапазон включает все целые числа в интервале, включая начальное и конечное число)
 *     Синтаксис диапазона должен быть использован для любого диапазона, где больше двух чисел.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    return nums.reduce((res, elem, index) => {
        if (res.length > 0) {
            const last = res[res.length - 1].split('-');
            if (last.length > 1) {
                if (elem - parseInt(last[1]) < 2) {
                    res.pop();
                    res.push(`${last[0]}-${elem}`);
                    return res;
                }
            }

            if (res.length > 1) {
                const beforeLast = res[res.length - 2];
                if (beforeLast.split('-').length == 1 && elem - parseInt(beforeLast) == 2) {
                    res.pop();
                    res.push(`${res.pop()}-${elem}`);
                    return res;
                }
            }
        }
        res.push(elem.toString());
        return res;
}, []).toString();
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};  
