/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const episodes = require('./episodes');
var request = require("request");

////////////////////////////////
// Helper functions //
////////////////////////////////

const rickMortyCharactersApiUrl = 'https://rickandmortyapi.com/api/character/'

const SKILL_NAME = 'Rick y Morty';
const NUM_MAX_SEASONS = 3;

const statusCharacterLive = "vivos"
const statusCharacterLiveApi = "Alive"
const statusCharacterDeath = "muertos"
const statusCharacterDeathUrl = "Dead"
const statusCharacterUnknown = "desaparecidos"
const statusCharacterUnknownUrl = "unknown"

const welcomeMessage = '¡Bienvenidos a Rick y Morty! Puedes preguntarme sobre el nombre de un episodio o los personajes que salen en él';
const exitSkillMessage = 'Gracias por usar Rick y Morty para informarte de tu serie favorita!  Espero que vuelvas pronto!';
const helpMessage = 'Conozco el estado de todos los personajes de la serie.  Prueba a preguntarme por un episodio y dime si quieres que te diga los personajes que están vivos, muertos o que se desconoce cómo se encuentran.  ¿Qué te episodio quieres consultar?';

const errorSeasonMessage = 'La serie tiene 3 temporadas, ¿Para cuál temporada quieres hacer el cálculo?';
const errorMaxSeasonMessage = 'La serie tiene 3 temporadas, por favor, dinos para cuál quieres hacer el cálculo';
const errorSeasonReprontMessage = 'Para poder hacer el cálculo de número de episodios, tienes que decir el número de la temporada';

const errorMaxEpisodeMessage = ', por favor dinos para cuál quieres hacer el cálculo';
const errorEpisodeMessage = 'Lo siento pero no he entendido el número de episodio, ¿A qué número de episodio te refieres?';

const errorMessageStatus = 'Los personajes pueden tener 3 estados, vivos, muertos y desaparecidos, dinos cual quieres seleccionar';
const errorMessageStatusRe = 'Elige entre vivos, muertos o desaparecidos';

const errorMessage = 'Lo siento no he podido entenderte, dime de nuevo qué es lo que quieres consultar';
const errorMessageCharacters = 'Lo siento, pero no hemos podido recuperar personajes para la consulta que has realizado';

/*getCharactersStatusSeasonAndNumber("muertos",2,2,(result) => {
  console.log(result);
});*/

////////////////////////////////
// Regular handlers //
////////////////////////////////

const LaunchRequestHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
      const speechText = welcomeMessage;
return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard(SKILL_NAME, speechText)
          .getResponse();
  }
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
      const speechText = helpMessage;
return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard(SKILL_NAME, speechText)
          .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
              || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
      const speechText = exitSkillMessage;
return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard(SKILL_NAME, speechText)
          .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
      //any cleanup logic goes here
      return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log("Error handled: "+error.message);
return handlerInput.responseBuilder
      .speak(errorMessage)
      .reprompt(errorMessage)
      .getResponse();
  },
};

////////////////////////////////
// Helper functions//
////////////////////////////////

const GetNumEpisodesSeasonIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'GetNumEpisodesSeasonIntent';
  },
  handle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      const responseBuilder = handlerInput.responseBuilder;
      const filledSlots = request.intent.slots;
      const slotValues = getSlotValues(filledSlots);
      
      if(!slotValues.numSeason.resolved || slotValues.numSeason.resolved === "?" ||  parseInt(slotValues.numSeason.resolved) <= 0  || slotValues.numSeason.resolved > NUM_MAX_SEASONS){
          return responseBuilder
                              .speak(errorMaxSeasonMessage)
                              .reprompt(errorSeasonReprontMessage)
                              .addElicitSlotDirective('numSeason')
                              .getResponse();
      }
      var numSeason = parseInt(slotValues.numSeason.resolved);
      return responseBuilder.speak(getNumEpisodesSeason(numSeason)).getResponse();
  }
};

const GetNameEpisodesSeasonIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'GetNameEpisodesSeasonIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const filledSlots = request.intent.slots;
    const slotValues = getSlotValues(filledSlots);
    if(!slotValues.numSeason.resolved || slotValues.numSeason.resolved === "?"  || parseInt(slotValues.numSeason.resolved) <= 0  || parseInt(slotValues.numSeason.resolved) > NUM_MAX_SEASONS) {
      return responseBuilder
                          .speak(errorSeasonMessage)
                          .reprompt(errorMaxSeasonMessage)
                          .addElicitSlotDirective('numSeason')
                          .getResponse();
    }else if (!slotValues.numEpisode.resolved || slotValues.numEpisode.resolved === "?" ||  parseInt(slotValues.numEpisode.resolved) <= 0  || parseInt(slotValues.numEpisode.resolved) > getNumEpisodesSeason(parseInt(slotValues.numSeason.resolved)) ){
      return responseBuilder
                          .speak(getNumEpisodesSeason(parseInt(slotValues.numSeason.resolved))+errorMaxEpisodeMessage)
                          .reprompt(errorEpisodeMessage)
                          .addElicitSlotDirective('numEpisode')
                          .getResponse();
    }
    var numSeason = parseInt(slotValues.numSeason.resolved);
    var numEpisode = parseInt(slotValues.numEpisode.resolved);
    return responseBuilder.speak(getNameEpisodeBySeasonAndNumber(numSeason,numEpisode)).getResponse();
  }
};

const InProgressGetStatusCharactersIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && request.intent.name === 'GetStatusCharactersIntent'
      && request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
      const responseBuilder = handlerInput.responseBuilder;
      const currentIntent = handlerInput.requestEnvelope.request.intent;
      const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
      const slotValues = getSlotValues(filledSlots);

      if(!slotValues.numSeason.resolved || slotValues.numSeason.resolved === "?"  || parseInt(slotValues.numSeason.resolved) <= 0  || parseInt(slotValues.numSeason.resolved) > NUM_MAX_SEASONS) {
        return responseBuilder
                            .speak(errorSeasonMessage)
                            .reprompt(errorMaxSeasonMessage)
                            .addElicitSlotDirective('numSeason')
                            .getResponse();
      }else if (!slotValues.numEpisode.resolved || slotValues.numEpisode.resolved === "?" ||  parseInt(slotValues.numEpisode.resolved) <= 0  || parseInt(slotValues.numEpisode.resolved) > getNumEpisodesSeason(parseInt(slotValues.numSeason.resolved))){
        return responseBuilder
                            .speak(getNumEpisodesSeason(parseInt(slotValues.numSeason.resolved))+errorMaxEpisodeMessage)
                            .reprompt(errorEpisodeMessage)
                            .addElicitSlotDirective('numEpisode')
                            .getResponse();
      }else if(( slotValues.statusValue.isValidated == false || slotValues.statusValue.resolved === "?" ) && slotValues.statusValue.isAsked == true){
          return handlerInput.responseBuilder
                             .speak(errorMessageStatus)
                             .reprompt(errorMessageStatusRe)
                             .addElicitSlotDirective('statusValue')
                             .getResponse()
      }else{
          return handlerInput.responseBuilder
          .addDelegateDirective(currentIntent)
          .getResponse();
      }
    },
};

const CompletedGetStatusCharactersIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetStatusCharactersIntent';
  },
  handle(handlerInput) {

    const responseBuilder = handlerInput.responseBuilder;
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);

    var numSeason = parseInt(slotValues.numSeason.resolved);
    var numEpisode = parseInt(slotValues.numEpisode.resolved);
    var statusValue = slotValues.statusValue.resolved;

    if (numSeason!== "?" && numEpisode!== "?" && statusValue!== "?"){
      return new Promise((resolve) => {
        getCharactersStatusSeasonAndNumber(statusValue,numSeason,numEpisode,(result) => {
                  resolve(responseBuilder.speak(result).getResponse());
              });
          });
    }else{
      resolve(responseBuilder.speak(errorMessageCharacters).getResponse());
    }
  },
};

////////////////////////////////
// Episodes and Seasons functions//
////////////////////////////////

function getCharactersStatusSeasonAndNumber(status,numSeason,numEpisode,callback) {
    var realStatus = statusCharacterLiveApi
    if (status == statusCharacterDeath){
      realStatus = statusCharacterDeathUrl
    }else if (status == statusCharacterUnknown){
      realStatus = statusCharacterUnknownUrl
    }
    var currentCharactersUrl = getCharactersEpisodeBySeasonAndNumber(numSeason,numEpisode)
    var urlParameters = ""
    currentCharactersUrl.forEach(function(stringUrl){
      var urlId = stringUrl.replace(rickMortyCharactersApiUrl,"")
      if (urlParameters.length == 0){
        urlParameters = urlId
      }else{
        urlParameters = urlParameters+","+urlId
      }
    });
    if (urlParameters.length == 0){
        callback(errorMessageCharacters);
        return
    }
    var requestUrl = rickMortyCharactersApiUrl+urlParameters
    request(requestUrl, function (error, response, body) {
      if (error) {
          callback(errorMessageCharacters);
          return
      } else {
          var namesCharacters = "";
          const currentCharacters = JSON.parse(body);    
          currentCharacters.forEach(function(character){
            if (character.status == realStatus){
              if (namesCharacters.length == 0){
                namesCharacters = character.name
              }else{
                namesCharacters = namesCharacters+", "+character.name
              }
            }
          });
          if (namesCharacters.length == 0){
            callback(errorMessageCharacters);
            return
          }else{
            callback("Estos son los personajes que he encontrado "+namesCharacters);
            return
          }
      }
  });
}


function getNumEpisodesSeason(numSeason){
  var currentEpisodes = getSeasonByNumber(numSeason);
  return "La temporada "+numSeason+" tiene "+currentEpisodes.length+" episodios";
}

function getNameEpisodeBySeasonAndNumber(numSeason,numEpisode){
  var currentEpisodes = getSeasonByNumber(numSeason);
  if (currentEpisodes.length >= numEpisode){
    return "El título del episodio "+numEpisode+" de la temporada "+numSeason+" es "+ currentEpisodes[numEpisode-1].name;
  }else{
    return "La temporada "+numSeason+" solo tiene "+ currentEpisodes.length + " episodios";
  }
}

function getCharactersEpisodeBySeasonAndNumber(numSeason,numEpisode){
  var currentEpisodes = getSeasonByNumber(numSeason);
  if (currentEpisodes.length >= numEpisode){
    return currentEpisodes[numEpisode-1].characters;
  }else{
    return [];
  }
}

function getSeasonByNumber(numSeason){
  var currentEpisodes = episodes.EPISODES_SEASON_1;
  switch(numSeason) {
    case 2:
        currentEpisodes = episodes.EPISODES_SEASON_2;
        break;
    case 3:
        currentEpisodes = episodes.EPISODES_SEASON_3;
        break;
    default:
        break;
  }
  return currentEpisodes;
}


////////////////////////////////
// Helper functions//
////////////////////////////////

function getSlotValues(filledSlots) {
  const slotValues = {};

  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
            isAsked:true
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
            isAsked: true
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
        isAsked: false
      };
    }
  }, this);

  return slotValues;
}

////////////////////////////////
// Code for the handlers here //
////////////////////////////////


exports.handler = Alexa.SkillBuilders.custom()
    .addErrorHandlers(ErrorHandler)
    .addRequestHandlers(LaunchRequestHandler,
                         HelpIntentHandler,
                         InProgressGetStatusCharactersIntent,
                         CompletedGetStatusCharactersIntentHandler,
                         GetNumEpisodesSeasonIntentHandler,
                         GetNameEpisodesSeasonIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();