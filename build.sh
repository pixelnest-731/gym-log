#!/bin/sh
# gym-log.html（claude.ai 版の本体）から GitHub Pages 用の index.html を作る
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
  printf '<meta name="theme-color" content="#0a0a09">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
  printf '<link rel="icon" type="image/png" href="icon-192.png">\n<link rel="manifest" href="manifest.json">\n'
  cat gym-log.html
  printf '\n</html>\n'
} > index.html
