# External Assets Audit — Minecraft 1.26.2 and FNAF ports

**Audit date:** 2026-10-09  
**Scope:** Minecraft 1.26.2 and all FNAF entries currently registered in the GameHub catalog.

## Summary

| Game | Repository | Runtime dependency found | Action |
|---|---|---|---|
| FNAF 1 | `gamefiles03/Fnaf_1` | JSZip 3.10.1 from cdnjs | Replaced with local `src/jszip.min.js` |
| FNAF 2 | `gamefiles03/Fnaf_2` | JSZip 3.10.1 from cdnjs | Replaced with local `src/jszip.min.js` |
| FNAF 3 | `gamefiles03/Fnaf_3` | JSZip 3.10.1 from cdnjs | Replaced with local `src/jszip.min.js` |
| FNAF 4 | `gamefiles01/Fnaf_4` | JSZip 3.10.1 from cdnjs | Replaced with local `src/jszip.min.js` |
| FNAF Sister Location | `gamefiles02/Fnaf_Sister_Location` | JSZip 3.10.1 from cdnjs | Replaced with local `src/jszip.min.js` |
| FNAF Ultimate Custom Night | `gamefiles03/Fnaf_Ultimate_Custom_Night` | JSZip 3.10.1 from cdnjs | Replaced with local `src/jszip.min.js` |
| Minecraft 1.26.2 | `gamefiles03/Minecraft/1.26.2.html` | No third-party runtime URL found | No external download required |

## FNAF dependency details

All six FNAF ports previously referenced the same third-party runtime script:

```text
https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
```

The dependency is now hosted inside each game directory:

```text
Fnaf_1/src/jszip.min.js
Fnaf_2/src/jszip.min.js
Fnaf_3/src/jszip.min.js
Fnaf_4/src/jszip.min.js
Fnaf_Sister_Location/src/jszip.min.js
Fnaf_Ultimate_Custom_Night/src/jszip.min.js
```

Each `index.html` now uses:

```html
<script src="src/jszip.min.js"></script>
```

The local file is **JSZip v3.10.1**, downloaded from the official cdnjs distribution URL during the migration and committed to the corresponding asset repository.

### Non-runtime FNAF links

The FNAF launcher screens also contain this Discord invitation link:

```text
https://discord.gg/xuu8TnSY4b
```

It is a social/UI link, not a file or runtime dependency. It was not required for game execution and was therefore not copied as an asset. The JSZip dependency was the only third-party file required by the FNAF launchers.

## Minecraft 1.26.2 analysis

File audited:

```text
Minecraft/1.26.2.html
```

Size at audit time: approximately **75.6 MB**.

### External URL result

No ordinary `http://` or `https://` runtime URL was found in the HTML. The build is a single-file deployment with its main payloads embedded in the document.

The HTML contains logical relative names such as:

```text
brotli_dec_wasm_bg.wasm
mesh-worker.wasm
server-worker.wasm
classes.wasm
classes.wasm-runtime.js
worker-bootstrap.js
```

These are **not missing third-party downloads in this build**. The single-file loader intercepts the corresponding requests, decompresses payloads embedded inside `1.26.2.html`, and returns them locally as `Response`/`Blob` data. The worker bootstrap is also exposed through an inline Blob URL when the single-file runtime initializes.

The local favicon reference is:

```text
Eaglercraft1262/favicon.png
```

That file is already present in `gamefiles03/Minecraft/Eaglercraft1262/favicon.png`.

### Minecraft conclusion

No chunking or external-file download was necessary for Minecraft 1.26.2. Splitting the HTML or extracting its embedded WASM files would risk breaking the single-file bootstrap and would not improve third-party hosting independence.

## Publication records

### FNAF 4 — `gamefiles01`

- Index update commit: `323cbcc1d654b6c08a0081a5bbf04bcbc9d9aaa8`
- Local JSZip commit: `2a358a69f9c728c2eddd7e3193b6a35ba0aaebe3`

### FNAF Sister Location — `gamefiles02`

- Index update commit: `19c605371356006bd9bb34cab3f7a4742d4990a1`
- Local JSZip commit: `6312940d9d101f8a41cef1362f7d1799ffb14ac3`

### FNAF 1 — `gamefiles03`

- Index update commit: `0d031472cb0fbc88330fcd5d0a6cd557ef5f0d5b`
- Local JSZip commit: `c2fc0a128a5072f4c54d3e6fea8489046557f977`

### FNAF 2 — `gamefiles03`

- Index update commit: `9da5487e3d2bd917c27eec1420b86a73a0348ef4`
- Local JSZip commit: `17b5b0e1b7f979eebf3737a8d82fab331c97707b`

### FNAF 3 — `gamefiles03`

- Index update commit: `fa3b467eadff38013e755bf8221f4c65762f1212`
- Local JSZip commit: `420b6761a7b616314bb00e0818f4c5f314d54a52`

### FNAF Ultimate Custom Night — `gamefiles03`

- Index update commit: `6a2b597efc1368d8e9c8430358ee993b0b191c76`
- Local JSZip commit: `224f34ac9890c8026c1e4caf060c10d4e9826d93`

## Validation checklist

- [x] All six FNAF `index.html` files no longer reference cdnjs JSZip.
- [x] A local JSZip file exists in every FNAF directory.
- [x] Minecraft 1.26.2 has no ordinary third-party runtime URL.
- [x] Minecraft's relative WASM names are resolved by its inline single-file loader.
- [x] No game-lock, site-lock, or access-control mechanism was removed or bypassed.

> This report covers the Minecraft 1.26.2 and FNAF ports requested in this pass. It does not claim that every unrelated third-party URL in every other GameHub game has been migrated.
