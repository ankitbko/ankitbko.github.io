---
layout: post
title: Transferring chat to a human agent using Microsoft Bot Framework 
comments: true
tags: [Microsoft Bot Framework, Bots, Chat Bots, Conversational Apps, Agent, Human, Live Agent Transfer]
description: A tutorial on how to perform live agent transfer / human handover using Microsoft Bot Framework
---

> Source Code: [Human Handover Bot](https://github.com/ankitbko/human-handoff-bot)


One of the frequent questions which I am asked is how to transfer chat to a human from the bot. It is specially necessary if your bot is in space of customer service. Chat bots are not meant to (or atleast, not mature enough currently) to completely replace humans. Many a times chat bot will fail to answer satisfactorily or user would just want to talk to a human from the start. When this happens the chatbot should transfer the control to a human agent or a customer care representative. But how can we achieve that?


In this article I will give an overview on how we can integrate a live chat into our bot using Microsoft Bot Framework. Microsoft Bot Framework is highly extensible and let us do this easily. The source code is available over at my github repo.


### High Level Overview

Our bot would be central piece to whole solution. Apart from performing all it's normal functionality, our bot would also act as a proxy between user and agent. So what is required to create this feature and who are the actors involved?

#### Actors Involved

- **Bot**: Well, we have our bot (duh!).
- **Users**: Users are our customers who would be using our bot. Our users can be on any channel which are supported by Bot Framework.
- **Agent**: Agents are humans who would chat with our users. Our agent will also need a chat window. For this we will use [Bot Framework Web Chat](https://github.com/Microsoft/BotFramework-WebChat) as a dashboard for our agents.

### Running the bot

Let us first run the bot and see how it works. Nothing helps better in understanding than running the code and seeing it first hand. 

#### Solution Structure

![Solution Structure](/assets/images/posts/human-agent/soln.png)

The most important pieces of code which I want to highlight are

- **Agent** folder contains everything related to agent management and routing implementation.
- **AgentDashboard** folder contains **index.html** which has Web Chat control embedded. We will use this page for agent to chat. How it works we will see later.
- **Scorable** folder contains two `IScorable` implementations which serves as middleware to route messages. We will get into its details later.
 - **AgentModule** class contains `Autofac` registrations for our project.




### Getting Started

To use CRIS you would need to get a subscription from [Azure](https://portal.azure.com). Don't worry, CRIS is free till 5000 requests/month, so you could try it out. Once you get your subscription key, you need to add it to CRIS portal. Follow the [guide](https://cris.ai/Home/Help#Preparing your subscription) to get it done.  


We would be using the same source code that I created for [skype call a bot](https://ankitbko.github.io/2016/11/skype-call-your-bot/) post. We would just modify it to support CRIS. I recommend you go through the post first before continuing. Since we would be using the same code base, we would inherit all the bad designs which I described in previous post specially how the response is sent. I absolutely dislike the way I had done it. You are better off using some other way(preferably reactive programming) to achieve the same. In any case, the source code could be found [here](https://github.com/ankitbko/rent-a-car-with-cris).

### Training Language Model

As mentioned above, training data for Language model is just plaintext file. The file should contain list of utterances with one sentence per line. The sentences may not be complete sentences or grammatically correct as long as it accurately reflects what user would speak. There are some main requirements such as encoding, size limit etc which you can read in the [documentation](https://cris.ai/Home/Help#Preparing the data for a custom language model).  

I have created a simple file for sample which you could find in CRIS folder in the code. Note that I have just added few sentences for example purpose. Feel free to extend it by adding more sentences. Also you could add part of sentence or words which you think user would most likely speak such as city names.  


Once we have training data ready we need to import it in CRIS. Go to [Language Data](https://cris.ai/LanguageDatasets) tab by clicking on *Menu -> Language Data* and click on *Import New*. Enter the data name and select the text file to upload.

![Language Data Upload](/assets/images/posts/cris/data_upload.png)

Once the training data is uploaded it would be queued for processing. You could check the status of it by going to *Language Data* tab(it should redirect automatically). Wait till it status is shown as *Complete*.

Next we need to create a Language Model. Go to [Language Model](https://cris.ai/LanguageModels) page and click on *Create New*. Give a name and description to your model. There are two types of base model - 

- **Microsoft Conversational Model** is optimized for recognizing speech spoken in conversational style.

- **Microsoft Search and Dictation Model** is appropriate for short commands, search queries etc.

We would be using the *Conversational Model* base model, since we expect our user to *talk* to our bot rather than give commands. Select the Language Data that we uploaded in previous step. Once form is filled click on *Submit*.

![Language Model Create](/assets/images/posts/cris/create_language_model.png)

Similar to previous step, the language model training would take some time. Wait till the status is *Complete*.


Once the model is successfully created, go to *Deployments* page and create a new deployment. In the form presented, select the base model as *Microsoft Conversational Model* and select our trained Language model. For Acoustic Model, select the default base model which is shown.

![Deployment Create](/assets/images/posts/cris/deployment.png)


Once the deployment is complete, you would be redirected to the Deployment Information page where you would need to copy the Url specified in `WebSocket for ShortPhrase Mode`. We would require the Url later in the code.

![Deployment Complete](/assets/images/posts/cris/deployment_complete.png)

### Integrating CRIS with Bing Speech SDK

We would continue using the Bing Speech client library for STT. But instead of calling to Bing Speech API we would send the speech to our CRIS deployment. We only need to change how our `DataRecognitionClient` is created as shown below.


```csharp
 public string SubscriptionKey { get; } = "CRIS SubscriptionKey";
 public string CrisUri { get; } = "CRIS ShortPhrase Mode URL";
 public string AuthenticationUri { get; } = "https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken";

 public void CreateDataRecoClient()
 {
     dataClient = SpeechRecognitionServiceFactory.CreateDataClient(
         SpeechRecognitionMode.ShortPhrase,
         DefaultLocale,
         SubscriptionKey,
         SubscriptionKey,
         CrisUri);

     dataClient.AuthenticationUri = AuthenticationUri;

     dataClient.OnResponseReceived += OnDataShortPhraseResponseReceivedHandler;
 }
```

Paste the deployment URI for Short Phrase which we copied from before in `CrisUri` and also enter the CRIS subscription key in `SubscriptionKey`. We would continue to use the `ShortPhrase` mode as we did before. The only difference now is that the speech is now sent to CRIS instead of Bing Speech API. Leave the `AuthenticationUri` as it is as it does not needs to be changed.


Apart from this there are no other changes required. You could run the bot as it is and it would work out. Check my [previous](https://ankitbko.github.io/2016/11/skype-call-your-bot/) post on how to run and test this bot. Do not forget to a valid LUIS *subscription key* in `RentLuisDialog` and change *MicrosoftAppId*, *MicrosoftAppPassword* and *CallbackUrl* appropriately.

 
### Conclusion

I have been waiting for CRIS for a long time and it is finally available to use. It works so much better than Bing Speech API and looks really promising. However I don't think that Calling Bot is matured enough yet. It looks a little sketchy and entire flow is not smooth, but it is still in preview so lets wait and watch. Meanwhile try out training [Acoustic Model](https://cris.ai/Home/Help#Creating a custom acoustic model) and let me know in the comments how did it work out.  