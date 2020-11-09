from flask import Flask, request, Response, render_template
from flask_cors import CORS
from SPARQLWrapper import SPARQLWrapper, JSON, POST
import logging
import requests

app = Flask(__name__, template_folder='static/templates')
CORS(app)  # make the app cross-origin accessible


@app.route("/")
def index():
    """ Filling the barchart with JSON data from the smart connector """
    logging.info("index called!")
    return render_template('index.html')


@app.route("/plots")
def barchart_file_example():
    """ Example of how the barchart can be filled with JSON data from a file """
    logging.info("index called!")
    return render_template('graphs.html')


@app.route("/query")
def sparql_query():
    """ Forward a SPARQL query to the smart connector """
    logging.info("sparql query proxy called")

    endpoint = "https://localhost:3330/c2app/query"
    sparql = SPARQLWrapper(endpoint)
    
    fullQuery = request.args.get('query')
    
    logging.debug("Query: %s" % fullQuery)
    
    sparql.setQuery(fullQuery)
    sparql.setMethod(POST)
    sparql.setReturnFormat(JSON)
    
    failed = True
    while failed:
        logging.debug("Try to connect to my smart connector")
        try:
            results = sparql.query().convert()
            failed = False
            logging.info("Successfully queried to %s" % endpoint)
        except Exception as e:
            logging.error(e)
            time.sleep(5)
    
    logging.debug("results: %s" % results)
    return results
		

logging.basicConfig(level=logging.DEBUG)
logging.info("C2-JeF started...")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
