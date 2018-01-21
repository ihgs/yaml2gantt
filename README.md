# 線表作成ツール

[![Greenkeeper badge](https://badges.greenkeeper.io/ihgs/yaml2gantt.svg)](https://greenkeeper.io/)

Yaml ベースの定義ファイルから、SVG形式のガントチャートを作成

```
yaml2gantt -c config.yaml -o test.html tasks.yaml
```

![sample](./doc/images/senpyo.png)


出力形式は、html,svg,png を指定できます。(-f option)
また入力ファイルは、ローカルファイル以外に、Webページ(http,https)も指定可能です。

```
yaml2gantt https://raw.githubusercontent.com/ihgs/yaml2gantt/master/sample/tasks.yaml
```

## 動作環境

* Node v6以上

## 使用方法

```
  Usage: yaml2gantt [options] <file>

  Options:

    -c, --config <config>        Set config path. default to ./config.yaml
    -o, --output <output_file>   Output to a specified file. [Default: input filename + ext in current directory.
    -f, --format <html|svg|png>  Output format.
    --compare <compare_file>     Set file which you want to compare
    --stdout                     Output to stdout [Default: output to a file.]
    -h, --help                   output usage information
```


## スケジュール比較

compareオプション(--compare)でtaskファイルを指定。  
resource名が一致するtaskが存在する場合、スケジュールバーの直上に
指定されたtaskのスケジュールバー(黄色)を表示

```
yaml2gantt --compare sample/old/tasks.yaml -o test.html sample/tasks.yaml
```

![compare](./doc/images/compare.png)


## 設定ファイル

yaml形式で設定情報を記述。  
configオプション(-c, --config)で指定。
指定しない場合、カレントディレクトリからconfig.yamlを探す。  



### canvas

ガントチャートの表示サイズを指定  
必須項目

| 設定項目   |  説明  |
|----------|-----|
| width    | 幅  |
| height   | 高さ |

### dateLabelType

時間軸の日付ラベル設定  
任意項目(default: every_day)


* every_day : 毎日表示
* every_week : 月曜日の日付のみ表示

### holidays

休日の設定。  
任意項目



## タスクファイル

yaml形式でタスクの情報を記述

### Range

ガントチャートとして表示する日付を記載。  
必須項目

| 設定項目   |  説明      |
|----------|------------|
| start    | 表示開始日時 |
| end      | 表示最終日   |

### Resources

表示するリソースの定義。  
以下のように定義する。
```
リソースID:
   type: リソースタイプ
   ...
```

指定できるリソースタイプは以下
* section
* subsection
* task
* external

#### section

区切り線を引き、名前を表示する。

#### subsection

下線付きで名前を表示する。

#### task

ガントチャートを表示

| 設定項目   |  説明      |
|----------|------------|
| name     | task名     |
| start    | 開始日      |
| end      | 終了日      |
| events   | eventの配列 |

event
* name: イベント名
* date: イベント日時

#### external

リソース定義を他のファイルから読み込む。  
読み込まれるファイルとRangeは無視される。


| 設定項目   |  説明                  |
|----------|------------------------|
| include  | 外部ファイルへの相対パス   |


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
