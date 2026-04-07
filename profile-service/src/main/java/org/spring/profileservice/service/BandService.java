package org.spring.profileservice.service;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.repository.BandRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BandService {

    private final BandRepository bandRepository;
}
