from flask import Flask, jsonify, request
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS, cross_origin
from app import *

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)
# api = Api(app)

# request_args = reqparse.RequestParser()
# request_args.add_argument("url", type=str, help="url of the video.", required=True)

# class GetStart(Resource):
#     def post(self):
#         args = request_args.parse_args()
#         print(args)
#         start_time = get_file(args['url'])
#         return jsonify({'start_time': start_time})
  
# api.add_resource(GetStart, '/')

@app.route('/', methods=['POST'])
def posting():
    args = request.get_json()
    print(args)
    start_time = get_file(args['url'])
    return jsonify({'start_time': start_time})

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug='True')