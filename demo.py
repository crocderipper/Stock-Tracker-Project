from flask import Flask, redirect, url_for, render_template, send_file, jsonify # type: ignore
import yfinance as yf # type: ignore
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")


screen = yf.screen("most_actives", count=10)

#page = ""
#for ticker in screen["quotes"]:
#    page += f"{ticker['symbol']}: {ticker['longName']} - {ticker['regularMarketVolume']} - {ticker['regularMarketPrice']} - {ticker['marketCap']} - {ticker['regularMarketChange']} - {ticker['regularMarketChangePercent']}%\n"
#print(page)

ticker = yf.Ticker("MSFT").history(period="1mo")
print(type(ticker))

#Flask App

app = Flask(__name__)

@app.template_filter("compact_number")
def compact_number(value):
    if value is None:
        return "N/A"

    value = float(value)

    if value >= 1_000_000_000_000:
        return f"{value / 1_000_000_000_000:.2f} T"
    elif value >= 1_000_000_000:
        return f"{value / 1_000_000_000:.2f} B"
    elif value >= 1_000_000:
        return f"{value / 1_000_000:.2f} M"
    elif value >= 1_000:
        return f"{value / 1_000:.2f} K"
    else:
        return str(int(value))
    
@app.route("/")
def index():
    return render_template("index.html", screen = screen)



@app.route("/api/stock/<symbol>")
def stock_api(symbol):
    symbol = symbol.upper()

    df = yf.Ticker(symbol).history(period="1mo")

    if df.empty:
        return jsonify({
            "symbol": symbol,
            "data": []
        })

    df = df.reset_index()

    stock_data = []

    for _, row in df.iterrows():
        stock_data.append({
            "date": row["Date"].strftime("%Y-%m-%d"),
            "close": round(row["Close"], 2)
        })

    return jsonify({
        "symbol": symbol,
        "data": stock_data
    })
#Graph page
@app.route("/stock/<symbol>")
def stock_page(symbol):
    return render_template("stock.html", symbol=symbol.upper())




if __name__ == "__main__":
    app.run()