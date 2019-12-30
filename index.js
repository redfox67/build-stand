/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates.  All Rights Reserved.
 *
 * You may not use this file except in compliance with the terms and conditions 
 * set forth in the accompanying LICENSE.TXT file.
 *
 * THESE MATERIALS ARE PROVIDED ON AN "AS IS" BASIS. AMAZON SPECIFICALLY DISCLAIMS, WITH 
 * RESPECT TO THESE MATERIALS, ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING 
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
*/

// This sample demonstrates sending directives to an Echo connected gadget from an Alexa skill
// using the Alexa Skills Kit SDK (v2). Please visit https://alexa.design/cookbook for additional
// examples on implementing slots, dialog management, session persistence, api calls, and more.

const Alexa = require('ask-sdk-core');
const Util = require('./util');
const Common = require('./common');

// The namespace of the custom directive to be sent by this skill
const NAMESPACE = 'Custom.Mindstorms.Gadget';

// The name of the custom directive to be sent this skill
const NAME_CONTROL = 'control';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle: async function(handlerInput) {

        let request = handlerInput.requestEnvelope;
        let { apiEndpoint, apiAccessToken } = request.context.System;
        let apiResponse = await Util.getConnectedEndpoints(apiEndpoint, apiAccessToken);
        if ((apiResponse.endpoints || []).length === 0) {
            return handlerInput.responseBuilder
            .speak(`I couldn't find an EV3 Brick connected to this Echo device. Please check to make sure your EV3 Brick is connected, and try again.`)
            .getResponse();
        }

        // Store the gadget endpointId to be used in this skill session
        let endpointId = apiResponse.endpoints[0].endpointId || [];
        Util.putSessionAttribute(handlerInput, 'endpointId', endpointId);

        return handlerInput.responseBuilder
            .speak("Welcome, you can start issuing move commands")
            .reprompt("Awaiting commands")
            .getResponse();
    }
};

// Add the speed value to the session attribute.
// This allows other intent handler to use the specified speed value
// without asking the user for input.
const SetSpeedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetSpeedIntent';
    },
    handle: function (handlerInput) {/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates.  All Rights Reserved.
 *
 * You may not use this file except in compliance with the terms and conditions 
 * set forth in the accompanying LICENSE.TXT file.
 *
 * THESE MATERIALS ARE PROVIDED ON AN "AS IS" BASIS. AMAZON SPECIFICALLY DISCLAIMS, WITH 
 * RESPECT TO THESE MATERIALS, ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING 
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
*/

'use strict'

const Alexa = require('ask-sdk-core');

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("I don't understand this command, try again")
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The request interceptor is used for request handling testing and debugging.
// It will simply log the request in raw json format before any processing is performed.
const RequestInterceptor = {
    process(handlerInput) {
        let { attributesManager, requestEnvelope } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();

        // Log the request for debug purposes.
        console.log(`=====Request==${JSON.stringify(requestEnvelope)}`);
        console.log(`=========SessionAttributes==${JSON.stringify(sessionAttributes, null, 2)}`);
    }
};

module.exports = {
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
    ErrorHandler,
    RequestInterceptor
    };

        // Bound speed to (1-100)
        let speed = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Speed');
        speed = Math.max(1, Math.min(100, parseInt(speed)));
        Util.putSessionAttribute(handlerInput, 'speed', speed);

        return handlerInput.responseBuilder
            .speak(`speed set to ${speed} percent.`)
            .reprompt("awaiting command")
            .getResponse();
    }
};

// Construct and send a custom directive to the connected gadget with
// data from the MoveIntent request.
const MoveIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MoveIntent';
    },
    handle: function (handlerInput) {
        const request = handlerInput.requestEnvelope;
        const direction = Alexa.getSlotValue(request, 'Direction');

        // Angle is optional, use default if not available
        const Angle = Alexa.getSlotValue(request, 'Angle') || "20";

        // Get data from session attribute
        const attributesManager = handlerInput.attributesManager;
        const speed = attributesManager.getSessionAttributes().speed || "10";
        const endpointId = attributesManager.getSessionAttributes().endpointId || [];

        // Construct the directive with the payload containing the move parameters
        const directive = Util.build(endpointId, NAMESPACE, NAME_CONTROL,
            {
                type: 'move',
                direction: direction,
                Angle: Angle,
                speed: speed
            });

        const speechOutput = (direction === "brake")
            ?  "Applying brake"
            : `${direction} ${Angle} seconds at ${speed} percent speed`;

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt("awaiting command")
            .addDirective(directive)
            .getResponse();
    }
};

// Construct and send a custom directive to the connected gadget with data from
// the SetCommandIntent request.
const SetCommandIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetCommandIntent';
    },
    handle: function (handlerInput) {

        let command = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Command');
        if (!command) {
            return handlerInput.responseBuilder
                .speak("Can you repeat that?")
                .reprompt("What was that again?").getResponse();
        }

        const attributesManager = handlerInput.attributesManager;
        let endpointId = attributesManager.getSessionAttributes().endpointId || [];
        let speed = attributesManager.getSessionAttributes().speed || "50";

        // Construct the directive with the payload containing the move parameters
        let directive = Util.build(endpointId, NAMESPACE, NAME_CONTROL,
            {
                type: 'command',
                command: command,
                speed: speed
            });

        return handlerInput.responseBuilder
            .speak(`command ${command} activated`)
            .reprompt("awaiting command")
            .addDirective(directive)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SetSpeedIntentHandler,
        SetCommandIntentHandler,
        MoveIntentHandler,
        Common.HelpIntentHandler,
        Common.CancelAndStopIntentHandler,
        Common.SessionEndedRequestHandler,
        Common.IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(Common.RequestInterceptor)
    .addErrorHandlers(
        Common.ErrorHandler,
    )
    .lambda();
