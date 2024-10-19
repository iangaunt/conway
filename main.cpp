#include <iostream>
#include <thread>
#include <SDL2/SDL.h>
#include <chrono>

using std::rand;
using std::srand;

const unsigned int ALIVE = 0xFF6BED6B;
const unsigned int STASIS = 0xFF3A6E3A;
const unsigned int DEAD = 0xFF131713;

bool is_valid_pos(int i, int j) {
    return i >= 0 && i <= 63 && j >= 0 && j <= 63;
}

int count_neighbors(unsigned int board[64][64], int i, int j) {
    int neighbors = 0;

    for (int k = -1; k <= 1; k++) {
        for (int l = -1; l <= 1; l++) {
            if (k == 0 && l == 0) continue;

            if (is_valid_pos(i + k, j + l) && board[i + k][j + l] == ALIVE) {
                neighbors++;
            }
        }
    }
    
    return neighbors;
}

void update_boards(unsigned int board[64][64], unsigned int prev[64][64]) {
    for (int i = 0; i < 64; i++) {
        for (int j = 0; j < 64; j++) {
            int neighbors = count_neighbors(prev, i, j);
            if (prev[i][j] == ALIVE) {
                board[i][j] = (neighbors == 2 || neighbors == 3) ? ALIVE : DEAD;
            } else {
                board[i][j] = (neighbors == 3) ? ALIVE : DEAD;
            }

            if (prev[i][j] == ALIVE && board[i][j] == DEAD) board[i][j] = STASIS;
        }
    }
}

void reset_boards(unsigned int board[64][64], unsigned int prev[64][64]) {
    for (int i = 0; i < 64; i++) {
        for (int j = 0; j < 64; j++) {
            prev[i][j] = (rand() % 3 == 0) ? ALIVE : DEAD;
            board[i][j] = DEAD;
        }
    }
}

int main(int argc, char *argv[]) {
    srand(time(NULL));
    SDL_Init(SDL_INIT_EVERYTHING);

    SDL_Window *window = SDL_CreateWindow(
        "conway", 
        SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED,
        640, 640, 
        SDL_WINDOW_ALLOW_HIGHDPI
    );
    
    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, 0);
	SDL_RenderSetLogicalSize(renderer, 640, 640);
    
    SDL_Texture* texture = 	texture = SDL_CreateTexture(
        renderer, 
        SDL_PIXELFORMAT_ARGB8888, 
        SDL_TEXTUREACCESS_STREAMING, 
        64, 64
    );

    if (window == NULL) return 1;

    unsigned int prev[64][64];
    unsigned int board[64][64];

    reset_boards(board, prev);

    bool running = true;
    bool paused = false;

    while (running) {
        if (!paused) update_boards(board, prev);
        
        SDL_UpdateTexture(texture, nullptr, board, 64 * sizeof(unsigned int));
        SDL_RenderClear(renderer);
        SDL_RenderCopy(renderer, texture, nullptr, nullptr);
        SDL_RenderPresent(renderer);

        for (int i = 0; i < 64; i++){
            for (int j = 0; j < 64; j++) {
                prev[i][j] = board[i][j];
            }
        }

        SDL_Event event;
        if (SDL_PollEvent(&event)) {
            switch (event.type) {
                case SDL_QUIT: {
                    running = false;
                    break;
                }

                case SDL_KEYDOWN: {
                    switch (event.key.keysym.sym) {
                        case SDLK_r: {
                            if (!paused) reset_boards(board, prev);
                            break;
                        } 

                        case SDLK_RIGHT: {
                            if (paused) update_boards(board, prev);
                            break;
                        }

                        case SDLK_SPACE: {
                            paused = !paused;
                            break;
                        }

                        case SDLK_ESCAPE: {
                            running = false;
                            break;
                        }
                    }
                }
            }
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(25));
    }

    SDL_DestroyWindow(window);
    SDL_Quit();

    return EXIT_SUCCESS;
}