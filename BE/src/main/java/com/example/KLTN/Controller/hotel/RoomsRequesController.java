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

        @PutMapping("/{id}/image")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateImage(@PathVariable("id") Long id,
                                                                   @RequestParam(value = "image", required = false) MultipartFile imageRooms,
                                                                   @RequestParam(value = "imageUrl", required = false) String imageUrl) {
            if (imageUrl != null && !imageUrl.isEmpty()) {
                return roomsService.UpdateImageUrl(id, imageUrl);
            } else if (imageRooms != null && !imageRooms.isEmpty()) {
                return roomsService.UpdateImage(id, imageRooms);
            } else {
                return ResponseEntity.badRequest().build();
            }
        }

        @PutMapping("/{id}/price")
        public ResponseEntity<Apireponsi<RoomsEntity>> updatePrice(@PathVariable("id") Long id,
                                                                   @RequestParam("price") double price) {
            return roomsService.UpdatePrice(id, price);
        }

        @PutMapping("/{id}/status")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateStatus(@PathVariable("id") Long id,
                                                                     @RequestParam("status") RoomsEntity.Status status) {
            return roomsService.updatestatus(id, status);
        }

        @PutMapping("/{id}/type")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateType(@PathVariable("id") Long id,
                                                                  @RequestParam("type") RoomsEntity.RoomType type) {
            return roomsService.updateType(id, type);
        }

        @PutMapping("/{id}/discount")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateDiscount(@PathVariable("id") Long id,
                                                                               @RequestParam("discount_percent") double discount_percent) {
            return roomsService.updatediscount_percent(id, discount_percent);
        }

        @PutMapping("/{id}/capacity")
        public ResponseEntity<Apireponsi<RoomsEntity>> updateCapacity(@PathVariable("id") Long id,
                                                                      @RequestParam("capacity") Integer capacity) {
            return roomsService.updatecapacity(id, capacity);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Apireponsi<RoomsEntity>> deleteRoom(@PathVariable("id") Long id) {
            return roomsService.softDeleteRoom(id);
        }
    }
