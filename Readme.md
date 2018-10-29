#  Skill de Rick y Morty para Alexa en Español

<img src="https://vignette.wikia.nocookie.net/rickandmorty/images/2/27/Pocket_mortys_banner.jpg" />

Skill implementada para Amazon Alexa utilizando la versión 2.1 de su SDK. Implementación para la distribución en su store en Español, se puede utilizar como template para implementar modelos de conversación, además de para generar request al exterior con las que construir las respuestas a los usuarios.

## Sobre la Skill

**Note:** Si estás pensando en desarrollar una nueva Skill en Español y quieres guiarte por este ejemplo, te recomiendo que eches un vistazo al [artículo en medium](https://planetachatbot.com/conversacion-alexa-espanol-6e90ae9401b) que publiqué para iniciarte en modelos de conversación y no tener problemas a la hora de pasar el proceso de certificación de Amazon.

### Uso

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

### Recursos adicionales

* La Skill utiliza la información obtenida del proyecto ["The Rick and Morty API"](https://rickandmortyapi.com/)
* Las librerías utilizadas en el proyecto de back-end son [Request](https://github.com/request/request) para las llamadas al API de Rick and Morty y la propia [librería de Alexa para Node.js](https://www.npmjs.com/package/ask-sdk) 

## Licencia

    MIT License

    Copyright (c) 2018 Alex Hernández

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

