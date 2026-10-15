import { describe, expect, it } from "vitest";
import { newestFirst } from "$lib/utils/helpers/productOrder";
import type { Product } from "$lib/types/product";

function row(code: string, scannedAt?: number): Product {
    return { code, scannedAt, product: { product_name: code, nutriments: {} } };
}

describe("newestFirst", () => {
    it("orders by scan time, not by barcode", () => {
        const rows = [
            row("3017620422003", 1_000), // lowest barcode, scanned first
            row("5449000000996", 3_000), // highest barcode, scanned last
            row("3168930010265", 2_000)
        ];

        expect(newestFirst(rows).map(r => r.code)).toEqual([
            "5449000000996",
            "3168930010265",
            "3017620422003"
        ]);
    });

    it("keeps the most recent scan first even when its barcode sorts lowest", () => {
        const rows = [row("9999999999999", 1), row("0000000000001", 2)];

        expect(newestFirst(rows).map(r => r.code)).toEqual([
            "0000000000001",
            "9999999999999"
        ]);
    });

    it("punts rows without a timestamp to code order without throwing", () => {
        const rows = [row("1111111111116"), row("2222222222223"), row("3333333333330", 5)];

        expect(newestFirst(rows).map(r => r.code)).toEqual([
            "3333333333330",
            "2222222222223",
            "1111111111116"
        ]);
    });

    it("keeps equal timestamps in a stable, repeatable order", () => {
        const rows = [row("1111111111116", 7), row("2222222222223", 7), row("3333333333330", 7)];

        const once = newestFirst(rows).map(r => r.code);
        const twice = newestFirst(rows).map(r => r.code);

        expect(once).toEqual(twice);
        expect(once).toEqual(["3333333333330", "2222222222223", "1111111111116"]);
    });

    it("does not mutate the array it is given", () => {
        const rows = [row("1111111111116", 1), row("2222222222223", 2)];

        newestFirst(rows);

        expect(rows.map(r => r.code)).toEqual(["1111111111116", "2222222222223"]);
    });
});
