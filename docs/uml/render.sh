#!/usr/bin/env bash
# Rendert alle PlantUML-Quellen als PNG und SVG.
#
# plantuml.jar wird bei Bedarf heruntergeladen und ist bewusst nicht
# versioniert (21 MB Binaerdatei gehoeren nicht in ein Quellcode-Repository).
#
# Voraussetzungen: Java und Graphviz (apt install graphviz).
set -euo pipefail

DOCS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JAR="$DOCS/uml/plantuml.jar"
VERSION="1.2024.8"

if [[ ! -f "$JAR" ]]; then
  echo "Lade plantuml.jar $VERSION ..."
  curl -fsSL -o "$JAR" \
    "https://github.com/plantuml/plantuml/releases/download/v${VERSION}/plantuml-${VERSION}.jar"
fi

for f in "$DOCS"/uml/*.puml "$DOCS"/er/*.puml "$DOCS"/*.puml; do
  [[ -e "$f" ]] || continue
  echo "  → $(basename "$f")"
  java -jar "$JAR" -tpng "$f"
  java -jar "$JAR" -tsvg "$f"
done

echo "Diagramme aktualisiert."
