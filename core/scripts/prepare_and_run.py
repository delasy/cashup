#!/usr/bin/env python3

import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib import request
from urllib.error import HTTPError

import download_from_dutascopy

build_dir = Path.cwd() / "build"
ticker = "AAPL"


def data_to_hpp(file_csv):
    file_hpp = Path.cwd() / "data" / "data.hpp"

    if file_hpp.is_file():
        file_hpp.unlink()

    fd_csv = file_csv.open('r', encoding="utf-8")
    lines = fd_csv.readlines()[1:]
    fd_csv.close()

    content = ""
    last_time = ""
    last_open = float(0)
    last_close = float(0)
    last_high = float(0)
    last_low = float(0)
    total_volume = float(0)
    count = 0

    for idx, line in enumerate(lines):
        cols = line.strip().split(',')
        current_time = cols[0][11:19]

        if last_time == current_time:
            current_high = float(cols[2])
            current_low = float(cols[2])
            current_volume = float(cols[4])

            if current_low < last_low:
                last_low = current_low

            if current_high > last_high:
                last_high = current_high

            last_close = float(cols[2])
            total_volume += current_volume

        if last_time == "" or last_time != current_time or idx == len(lines) - 1:
            if last_time != "":
                hh = int(last_time[0:2]) * 60 * 60
                mm = int(last_time[3:5]) * 60
                ss = int(last_time[6:8])
                time = float(hh + mm + ss - 52200)

                content += "  {"
                content += f" {time / 100000:.5f},"
                content += f" {last_open / 10000:.9f},"
                content += f" {last_high / 10000:.9f},"
                content += f" {last_low / 10000:.9f},"
                content += f" {last_close / 10000:.9f},"
                content += f" {total_volume / 1000000000:.9f}"
                content += " },\n"

                count += 1

            if idx != len(lines) - 1:
                last_time = current_time
                last_open = float(cols[2])
                last_close = float(cols[2])
                last_high = float(cols[2])
                last_low = float(cols[2])
                total_volume = float(cols[4])

    content_hpp = "#ifndef DATA_DATA_HPP\n"
    content_hpp += "#define DATA_DATA_HPP\n\n"
    content_hpp += f"#define DATA_SIZE {count}\n\n"
    content_hpp += "const float data[DATA_SIZE][6] = {\n"
    content_hpp += content[:-2]
    content_hpp += "\n};\n\n#endif\n"

    fd_hpp = file_hpp.open('w', encoding="utf-8")
    fd_hpp.write(content_hpp)
    fd_hpp.close()


def download_csv(file_csv, datestr):
    url = f"https://cashup.s3.eu-central-1.amazonaws.com/{ticker}_{datestr}.csv"
    req = request.urlopen(url)
    res = req.read().decode("utf-8")

    fd_csv = file_csv.open('w', encoding="utf-8")
    fd_csv.write(res)


def main(datestr):
    file_csv = Path.cwd() / "data" / f"{ticker}_{datestr}.csv"

    if not file_csv.is_file():
        try:
            download_csv(file_csv, datestr)
        except HTTPError:
            download_from_dutascopy.process(datetime.strptime(datestr, "%Y-%m-%d"))

    if not file_csv.is_file() or file_csv.stat().st_size == 0:
        raise Exception("This date is holiday or weekend")

    data_to_hpp(file_csv)

    subprocess.run(["cmake", "--build", "."], cwd=build_dir, stdout=subprocess.DEVNULL)
    subprocess.run(["build/cashup"])


if __name__ == "__main__":
    main(sys.argv[1])
