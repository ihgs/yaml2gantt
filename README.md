# 線表作成ツール

Yaml ベースの定義ファイルから、SVG形式のガントチャートを作成

```
yaml2gantt -c config.yaml -o test.svg tasks.yaml
```

## example

config.yaml
```
canvas:
  width: 1000
  height: 300
dateLabelType: every_day
holidays:
  - 2016/01/01
  - 2016/01/11
  - 2016/02/11
  - 2016/03/20
  - 2016/03/21
  - 2016/04/29
  - 2016/05/03
  - 2016/05/04
  - 2016/05/05
  - 2016/07/18
  - 2016/08/11
  - 2016/09/19
  - 2016/09/22
  - 2016/10/10
  - 2016/11/03
  - 2016/11/23
  - 2016/12/23
```

tasks.yaml
```
Range:
  start: 2016/06/01
  end: 2016/07/31
Resources:
  frontend:
    name: フロントエンド
    type: section
  bd:
    name: 仕様書作成
    type: task
    start: 2016/06/20
    end: 2016/06/30
    events:
      - name: 内部レビュー
        date: 2016/06/25
      - name: 外部レビュー
        date: 2016/06/30
  coding:
    name: コーディング
    type: task
    start: 2016/07/01
    end: 2016/07/10
    events:
      - name: 内部レビュー
        date: 2016/07/08
      - name: 外部レビュー
        date: 2016/07/10
  test:
    name: テスト
    type: task
    start: 2016/07/11
    end: 2016/07/18
  DB:
    name: DB
    type: section
```
