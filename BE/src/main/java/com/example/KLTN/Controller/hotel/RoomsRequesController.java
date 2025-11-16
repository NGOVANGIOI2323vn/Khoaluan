    package com.example.KLTN.Controller.hotel;

    import com.example.KLTN.Entity.RoomsEntity;
    import com.example.KLTN.Service.RoomsService;
    import com.example.KLTN.dto.Apireponsi;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;

    @RestController
    @RequestMapping("/api/rooms")
    @RequiredArgsConstructor
    public class RoomsRequesController {
        private final RoomsService roomsService;

        @PutMapping("/Image/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateImage(@PathVariable("id") Long id,
                                                                   @RequestParam("image") MultipartFile imageRooms) {
            return roomsService.UpdateImage(id, imageRooms);
        }

        @PutMapping("/Price/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> UpdatePrice(@PathVariable("id") Long id,
                                                                   @RequestParam("price") double price) {
            return roomsService.UpdatePrice(id, price);
        }

        @PutMapping("/status/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> update_status(@PathVariable("id") Long id,
                                                                     @RequestParam("status") RoomsEntity.Status status) {
            return roomsService.updatestatus(id, status);
        }

        @PutMapping("/type/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateType(@PathVariable("id") Long id,
                                                                  @RequestParam("type") RoomsEntity.RoomType type) {
            return roomsService.updateType(id, type);
        }

        @PutMapping("/discount_percent/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> update_discount_percent(@PathVariable("id") Long id,
                                                                               @RequestParam("discount_percent") double discount_percent) {
            return roomsService.updatediscount_percent(id, discount_percent);
        }

        @PutMapping("/capacity/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateCapacity(@PathVariable("id") Long id,
                                                                      @RequestParam("capacity") Integer capacity) {
            return roomsService.updatecapacity(id, capacity);
        }
    }
