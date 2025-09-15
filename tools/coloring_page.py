#!/usr/bin/env python3
"""
Convert a photo into clean black-and-white line art suitable for a colouring book page.

Pipeline:
1) Load image and convert to grayscale
2) Denoise slightly with bilateral filter to preserve edges
3) Edge detection (Canny) with adaptive thresholds
4) Morphological thinning and cleanup to get crisp lines
5) Optional detail suppression and posterization to reduce noise
6) Blend edges with lightly quantized tone lines (adaptive threshold) to retain contours
7) Output as white background with black lines (SVG-like look in PNG)

Usage:
  python tools/coloring_page.py --input path/to/image.jpg --output out.png

You can tweak parameters with flags; sensible defaults are provided.
"""

from __future__ import annotations

import argparse
import os
from typing import Tuple

import cv2
import numpy as np


def read_image_gray(path: str) -> np.ndarray:
    image = cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray


def auto_canny(image: np.ndarray, sigma: float = 0.33) -> np.ndarray:
    v = np.median(image)
    lower = int(max(0, (1.0 - sigma) * v))
    upper = int(min(255, (1.0 + sigma) * v))
    edged = cv2.Canny(image, lower, upper, L2gradient=True)
    return edged


def skeletonize(binary: np.ndarray) -> np.ndarray:
    """Zhang-Suen-like morphology skeletonization using OpenCV ops."""
    # Ensure binary is 0/255
    bin_img = (binary > 0).astype(np.uint8) * 255
    element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    done = False
    skel = np.zeros(bin_img.shape, np.uint8)
    while not done:
        eroded = cv2.erode(bin_img, element)
        temp = cv2.dilate(eroded, element)
        temp = cv2.subtract(bin_img, temp)
        skel = cv2.bitwise_or(skel, temp)
        bin_img = eroded.copy()
        done = cv2.countNonZero(bin_img) == 0
    return skel


def quantize_tones(gray: np.ndarray, k: int = 3) -> np.ndarray:
    """Posterize grayscale into k tones to reduce noise and create gentle guides."""
    z = gray.reshape((-1, 1)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _ret, labels, centers = cv2.kmeans(z, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS)
    centers = np.uint8(centers)
    quant = centers[labels.flatten()].reshape(gray.shape)
    return quant


def create_coloring_page(
    gray: np.ndarray,
    blur_bilateral: Tuple[int, float, float] = (7, 50, 50),
    canny_sigma: float = 0.33,
    edge_thicken: int = 1,
    skeletonize_edges: bool = True,
    tone_levels: int = 3,
    adaptive_block_size: int = 21,
    adaptive_C: int = 5,
) -> np.ndarray:
    # 1) Preserve edges while denoising
    d, sc, ss = blur_bilateral
    smooth = cv2.bilateralFilter(gray, d, sc, ss)

    # 2) Edge map
    edges = auto_canny(smooth, sigma=canny_sigma)

    # 3) Thin/thicken as needed
    if skeletonize_edges:
        thin = skeletonize(edges)
    else:
        thin = edges
    if edge_thicken > 0:
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (edge_thicken, edge_thicken))
        thin = cv2.dilate(thin, kernel, iterations=1)

    # 4) Create tone guidance using adaptive threshold and quantization
    quant = quantize_tones(smooth, k=max(2, tone_levels))
    adapt = cv2.adaptiveThreshold(
        quant, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, adaptive_block_size | 1, adaptive_C
    )

    # Lines should be black on white background
    lines = cv2.bitwise_not(thin)
    # Combine: ensure strong black lines; ignore tone speckles behind lines
    combined = cv2.min(adapt, lines)

    # Ensure pure black/white by threshold
    _, bw = cv2.threshold(combined, 200, 255, cv2.THRESH_BINARY)
    return bw


def save_png(image: np.ndarray, output_path: str) -> None:
    # Ensure parent directory exists
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    # Write using imencode to support unicode paths
    success, buf = cv2.imencode(".png", image)
    if not success:
        raise RuntimeError("Failed to encode PNG")
    buf.tofile(output_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert image to colouring-book line art.")
    parser.add_argument("--input", required=True, help="Path to input image")
    parser.add_argument("--output", required=True, help="Path to output PNG")
    parser.add_argument("--width", type=int, default=2048, help="Resize longest side to this (0 to keep)")
    parser.add_argument("--no-skeleton", action="store_true", help="Disable skeletonization stage")
    parser.add_argument("--edge-thicken", type=int, default=1, help="Dilate kernel size for edges (>=1)")
    parser.add_argument("--tone-levels", type=int, default=3, help="Posterization levels for tones")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    gray = read_image_gray(args.input)

    # Optional resize to make output crisp but manageable
    if args.width and args.width > 0:
        h, w = gray.shape[:2]
        scale = args.width / max(h, w)
        if scale != 1.0:
            new_size = (int(w * scale), int(h * scale))
            gray = cv2.resize(gray, new_size, interpolation=cv2.INTER_AREA)

    result = create_coloring_page(
        gray,
        skeletonize_edges=not args.no_skeleton,
        edge_thicken=max(1, args.edge_thicken),
        tone_levels=max(2, args.tone_levels),
    )

    save_png(result, args.output)


if __name__ == "__main__":
    main()

