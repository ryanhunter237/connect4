function makeNewGameButton(width, height, pressedFn) {
    let button = createButton('New Game');
    button.style('font-size', '32px');
    button.style('font-weight', 'bold');
    button.style('background-color', color(0,250,100,170));
    button.size(200);
    button.position(width/2 - 100, 0.445 * height);
    button.mousePressed(pressedFn);
    button.hide();
    return button;
}