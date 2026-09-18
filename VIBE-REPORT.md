# Vibe Report — EcoTrack

Configuré Cursor como el taller y Replit como el mostrador. En Cursor dejé un archivo `.cursorrules` que fija el stack (Next.js, TypeScript, Tailwind), pide código modular y prohíbe que el humano parchee sintaxis a mano. Esa regla no es cosmética: le dice al agente qué es el producto (un diario de huella en una frase) y qué no es (auth, pagos, dashboard). Con eso, el chat deja de ser un generador genérico y se vuelve un copiloto con límites.

La primera dificultad al delegar no fue el código, fue el disco: el scaffolding de Next.js llenó el volumen C: y el agente no pudo escribir archivos. En un flujo “escribe tú cada línea” eso se siente como un accidente local; en Vibe Coding se siente como un corte de corriente del orquestador. La segunda dificultad fue de dependencias: Vitest 5 no resolvió peers con `@types/node` 20. En vez de pelear el árbol, cambié a `node:test`, que ya viene en Node 22 y viaja mejor a Replit. Delegar no elimina el criterio: lo mueve al momento de elegir el camino más simple.

Otra fricción típica: el agente quiere “IA de verdad” (llamar a un LLM) y el aula pide un MVP que se pueda abrir en un enlace. Un prototipo que muere sin `OPENAI_API_KEY` no valida la idea. El compromiso fue un parser de lenguaje natural con factores transparentes. Sigue siendo vibe: el usuario habla en castellano; el sistema responde en kg. La honestidad del estimado (orden de magnitud, no inventario ISO) es parte del producto, no un disclaimer escondido.

Pasar de escribir código a orquestar una visión se siente menos como magia y más como dirección de escena. Tú decides el tono (cuaderno de campo, no dashboard SaaS), el ejemplo canónico (“carne y 20 km en bus”) y el criterio de listo (una URL, un test, unas reglas). El agente elige archivos, tests y CSS. Cuando el test falla porque el módulo aún no existe, eso no es un error humano: es el semáforo rojo del TDD que el agente también puede respetar.

Lo que más cambia es dónde pones la atención. Ya no discutes comas; discutes si el anillo topográfico comunica intensidad mejor que un número suelto, y si Replit debe arrancar sin secretos. El riesgo es relajarse y aceptar un UI genérico. Las reglas del proyecto y un vibe visual concreto (turba, cobre, líquenes; no plantilla crema-serif) son el antídoto.

Integrar Cursor y Replit cierra el círculo: localmente iteras con el agente; en la nube alguien más abre el mismo prototipo. El ecosistema no es “tener muchas herramientas”. Es que cada una tenga un rol y que las reglas del agente sepan cuál es.

*(~480 palabras)*
