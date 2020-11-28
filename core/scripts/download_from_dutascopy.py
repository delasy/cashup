#!/usr/bin/env python3

import lzma
import struct
from datetime import datetime, timedelta
from pathlib import Path
from urllib import request

ticker = "AAPL"
symbol = "AAPLUSUSD"


def tokenize(buf):
    token_size = 20
    token_count = int(len(buf) / token_size)

    return list(map(lambda x: struct.unpack_from(">3I2f", buf, token_size * x), range(0, token_count)))


def normalize(date, ms, ask, bid, ask_vol, bid_vol):
    date_ms = date + timedelta(milliseconds=ms)
    return [date_ms, ask / 1000, bid / 1000, ask_vol * 1000000, bid_vol * 1000000]


def download(date):
    url_prefix = "https://datafeed.dukascopy.com/datafeed"
    url_date = f"{date.year:04d}/{date.month - 1:02d}/{date.day:02d}"

    data = []

    for hours in range(0, 24):
        date_hour = date + timedelta(hours=hours)
        url = f"{url_prefix}/{symbol}/{url_date}/{hours:02d}h_ticks.bi5"

        req = request.urlopen(url)
        res = req.read()

        if len(res):
            res_data = lzma.decompress(res)
        else:
            res_data = []

        tokens = tokenize(res_data)
        data_tokens = list(map(lambda x: normalize(date_hour, *x), tokens))
        data.extend(data_tokens)

    return data


def process(date):
    datestr = date.strftime("%Y-%m-%d")
    file_csv = Path.cwd() / "data" / f"{ticker}_{datestr}.csv"

    if file_csv.is_file():
        return

    data = download(date)

    if not len(data):
        content = ""
    else:
        content = "DateTime,Ask,Bid,AskVolume,BidVolume\n"

        for item in data:
            content += item[0].strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + ','
            content += f"{item[1]:.3f},"
            content += f"{item[2]:.3f},"
            content += f"{item[3]:.4f},"
            content += f"{item[4]:.4f}\n"

    fd_csv = file_csv.open('w', encoding="utf-8")
    fd_csv.write(content)


def main():
    start_date = datetime.strptime("2017-01-26", "%Y-%m-%d")
    end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    date = start_date

    while date < end_date:
        process(date)
        date += timedelta(days=1)


if __name__ == "__main__":
    main()
