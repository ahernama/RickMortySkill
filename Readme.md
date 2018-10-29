#  Skill de Rick y Morty para Alexa en Español

<img src="https://vignette.wikia.nocookie.net/rickandmorty/images/2/27/Pocket_mortys_banner.jpg" />

Skill implementada para Amazon Alexa utilizando la versión 2.0 de su SDK. Implementación para la distribución en su store en Español, se puede utilizar como template para implementar modelos de conversación, además de para generar request al exterior con las que construir las respuestas a los usuarios.

## About

**Note:** Si estás pensando en desarrollar una nueva Skill en Español y quieres guiarte por este ejemplo, te recomiendo que eches un vistazo al [artículo en medium](https://planetachatbot.com/conversacion-alexa-espanol-6e90ae9401b) que publiqué para iniciarte en modelos de conversación y no tener problemas a la hora de pasar el proceso de certificación de Amazon.

### Usage

```text
Alexa, pregunta a Rick y Morty cuántos episodios tiene la primera temporada
	>> La temporada 1 tiene 11 episodios.
```
```text
Alexa, dime como se llama el tercer episodio de la segunda temporada
	>> El título del episodio 3 de la temporada 2 es Auto Erotic Assimilation.
```
```text
Alexa, dime todos los personajes que estén vivos en el episodio 4 de la temporada 2
	>> Estos son los personajes que he encontrado Rick Sanchez, Morty Smith, Summer Smith, Beth Smith, Jerry Smith, Jacob, Mr. Poopybutthole, Snuffles (Snowball).
```

### Repository Contents	

* `/lambda/custom` - Lógica de Back-end para la Skill de Alexa, desplegada en [AWS Lambda](https://aws.amazon.com/lambda/)
* `/models/es-ES.json` - JSON de modelo de interacción para Español (para ser incluído en la consola de desarrollo de la Skill)

### Pre-requisitos para un despliegue

* Node.js (> v4.3)
* Registro en [AWS Account](https://aws.amazon.com/)
* Registro en [Amazon Developer Account](https://developer.amazon.com/)
