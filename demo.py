from flask import Flask, redirect, url_for, render_template, send_file # type: ignore
import yfinance as yf # type: ignore
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
import io

screen = yf.screen("most_actives", count=10)

#page = ""
#for ticker in screen["quotes"]:
#    page += f"{ticker['symbol']}: {ticker['longName']} - {ticker['regularMarketVolume']} - {ticker['regularMarketPrice']} - {ticker['marketCap']} - {ticker['regularMarketChange']} - {ticker['regularMarketChangePercent']}%\n"
#print(page)

ticker = yf.Ticker("MSFT").history(period="1mo")


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

@app.route("/graph")
def graph():
    return render_template("graph.html", screen = screen)

@app.route("/plot/<symbol>")
def plot_stock(symbol):
    df = yf.Ticker(symbol).history(period="1mo")

    fig, ax = plt.subplots()
    ax.plot(df.index, df["Close"])
    ax.set_title(f"{symbol} Close Price")
    ax.set_xlabel("Date")
    ax.set_ylabel("Price")

    img = io.BytesIO()
    fig.savefig(img, format="png", bbox_inches="tight")
    plt.close(fig)

    img.seek(0)
    return send_file(img, mimetype="image/png")

if __name__ == "__main__":
    app.run()