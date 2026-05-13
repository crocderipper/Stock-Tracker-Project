from flask import Flask, redirect, url_for, render_template # type: ignore
import yfinance as yf # type: ignore

screen = yf.screen("most_actives", count=10)
print(type(screen))

#page = ""
#for ticker in screen["quotes"]:
#    page += f"{ticker['symbol']}: {ticker['longName']} - {ticker['regularMarketVolume']} - {ticker['regularMarketPrice']} - {ticker['marketCap']} - {ticker['regularMarketChange']} - {ticker['regularMarketChangePercent']}%\n"
#print(page)


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

if __name__ == "__main__":
    app.run()